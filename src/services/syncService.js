import { db } from '../db';
import { useConfigStore } from '../store/useConfigStore';
import { useAuthStore } from '../store/useAuthStore';
import { encryptData, decryptData, hashPassword } from '../utils/crypto';
import { logger } from './logger';
import { 
  collectAllSyncData, 
  restoreAllData, 
  calculateChecksum,
  validateRestoredData,
  isVersionCompatible,
  getDataStatistics,
  formatFileSize
} from '../utils/dataValidation';
import {
  detectConflicts,
  resolveConflicts,
  mergeConversations,
  mergeMessages,
  ResolutionStrategy
} from '../utils/conflictResolver';
import { getSyncApiUrl } from '../utils/envDetect';
import axios from 'axios';

/**
 * 数据同步服务
 * 负责本地数据与云端存储之间的双向同步、备份导出/导入及冲突解决
 */
class SyncService {
  constructor() {
    this.isSyncing = false;
    this.initialized = false;
    this.syncInterval = null;
    // 限制同步频率，避免频繁请求后端
    this.debouncedSync = this.debounce(this.syncToCloud.bind(this), 5000);
    this.proxyHealthCheckInterval = null;
    this.proxyStatus = {
      isAvailable: false,
      lastCheckTime: 0,
      errorCount: 0
    };
    // 云端同步专用配置
    this.cloudSyncConfig = {
      apiBaseUrl: '', 
      retryCount: 3,
      retryDelay: 1000,
      timeout: 10000
    };
    // 本地版本缓存，用于增量同步判断
    this.lastSyncVersions = this._loadLastSyncVersions();
  }

  /**
   * 简易防抖器
   */
  debounce(func, wait) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  /**
   * 启动同步服务
   * 建立 Store 订阅，监听核心数据变更并触发自动同步
   */
  async init() {
    if (this.initialized) return;

    // 动态获取 store 以解决可能的循环依赖导致的 undefined 问题
    let ConfigStore = useConfigStore;
    if (!ConfigStore) {
      const storeModule = await import('../store/useConfigStore');
      ConfigStore = storeModule.useConfigStore;
    }

    if (!ConfigStore) {
      logger.error('SyncService', 'Failed to initialize: useConfigStore is undefined');
      return;
    }

    this.initialized = true;
    logger.info('SyncService', 'Initializing...');
    
    // Subscribe to stores to trigger sync
    if (ConfigStore && typeof ConfigStore.subscribe === 'function') {
      ConfigStore.subscribe((state, prevState) => {
        if (state.cloudSync?.enabled && state.cloudSync?.autoSync) {
          // 优化：仅在核心配置（非同步状态本身）发生变化时触发同步
          const importantKeys = ['providers', 'defaultModels', 'general', 'proxy', 'conversationPresets'];
          const hasChanged = importantKeys.some(key => 
            JSON.stringify(state[key]) !== JSON.stringify(prevState[key])
          );
          
          if (hasChanged) {
            this.debouncedSync();
          }
        }
      });
    }

    // 监听数据库变化以触发自动同步
    try {
      if (db.on) {
         db.on('changes', (changes) => {
           const config = useConfigStore.getState();
           if (config.cloudSync?.enabled && config.cloudSync?.autoSync) {
              // 优化：排除日志表的变更，仅监听核心业务表
              const relevantTables = ['conversations', 'messages', 'images', 'knowledgeBases'];
              const relevant = changes.some(c => relevantTables.includes(c.table));
              if (relevant) {
                 this.debouncedSync();
              }
           }
         });
      }
    } catch (e) {
      logger.warn('SyncService', 'Database observer (dexie-observable) not available, auto-sync on DB changes disabled');
    }

    // Initial sync on startup if enabled
    const config = useConfigStore.getState();
    if (config.cloudSync?.enabled) {
      // 启动代理健康监控
      this.startProxyHealthMonitoring();
      // 延迟初次从云端同步，让应用先完成本地加载
      setTimeout(() => this.syncFromCloud(), 2000);
    }
  }

  /**
   * 计算同步标识符 (Sync ID)
   * 基于主密码派生出确定的唯一标识，用于在多端识别同一用户
   */
  async getSyncId(password) {
    // Generate a consistent ID from the password
    // In production, we should probably use a salt, but here we use a fixed salt for the "ID" derivation
    // to ensure the same password generates the same ID across devices.
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    );
    
    // Use a fixed salt for ID derivation so it's deterministic
    const fixedSalt = new TextEncoder().encode("AiPiBox_Cloud_Sync_ID_v1");
    
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: fixedSalt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      256
    );
    
    return Array.from(new Uint8Array(derivedBits))
      .map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * 执行全量推送同步
   */
  async syncToCloud() {
    if (this.isSyncing) return;
    
    const { sessionPassword, isAuthenticated } = useAuthStore.getState();
    const { cloudSync } = useConfigStore.getState();

    if (!isAuthenticated || !sessionPassword || !cloudSync?.enabled) {
      return;
    }

    // 执行同步前强制进行实时健康检查，确保不被旧的缓存错误阻断
    const isSyncAvailable = await this.checkProxyHealth(true);
    if (!isSyncAvailable) {
      logger.error('SyncService', 'Cannot sync: cloud sync server is not available');
      useConfigStore.getState().updateCloudSync({ 
        syncStatus: 'error', 
        lastError: 'Sync server unavailable' 
      });
      return;
    }

    this.isSyncing = true;
    logger.info('SyncService', 'Starting sync to cloud...');

    try {
      const syncId = await this.getSyncId(sessionPassword);
      
      // Gather data
      const configState = useConfigStore.getState();
      
      // Export DB data
      const conversations = await db.conversations.toArray();
      const messages = await db.messages.toArray();
      
      const payload = {
        config: {
            providers: configState.providers,
            defaultModels: configState.defaultModels,
            general: configState.general,
            proxy: configState.proxy, 
            searchSettings: configState.searchSettings,
            conversationPresets: configState.conversationPresets,
            conversationSettings: configState.conversationSettings
        },
        conversations,
        messages,
        timestamp: Date.now()
      };

      // Encrypt
      const encryptedData = await encryptData(payload, sessionPassword);
      
      // Send - 使用自动检测的 API URL
      const apiBaseUrl = this._getApiBaseUrl();
      
      await axios.post(`${apiBaseUrl}/api/sync`, {
        id: syncId,
        data: encryptedData,
        timestamp: payload.timestamp
      }, {
        timeout: 5000
      });

      // Update last sync time
      useConfigStore.getState().updateCloudSync({ lastSyncTime: Date.now() });
      logger.info('SyncService', 'Sync to cloud completed');

    } catch (error) {
      const errorMessage = this._extractErrorMessage(error);
      
      // 网络错误时，静默处理，避免频繁报错
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        logger.warn('SyncService', 'Cloud sync server unavailable, will retry later');
        // 仅更新状态，不自动禁用，等待下次自动重试或代理恢复
        useConfigStore.getState().updateCloudSync({ 
          syncStatus: 'error', 
          lastError: 'Cloud sync server unavailable' 
        });
      } else {
        logger.error('SyncService', 'Sync to cloud failed', { error, message: errorMessage });
        useConfigStore.getState().updateCloudSync({ 
          syncStatus: 'error', 
          lastError: errorMessage 
        });
      }
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * 执行全量拉取同步
   */
  async syncFromCloud() {
    const { sessionPassword, isAuthenticated } = useAuthStore.getState();
    const { cloudSync } = useConfigStore.getState();

    if (!isAuthenticated || !sessionPassword || !cloudSync?.enabled) {
      return;
    }

    // 执行同步前强制进行实时健康检查
    const isSyncAvailable = await this.checkProxyHealth(true);
    if (!isSyncAvailable) {
      logger.error('SyncService', 'Cannot sync from cloud: cloud sync server is not available');
      useConfigStore.getState().updateCloudSync({ 
        syncStatus: 'error', 
        lastError: 'Sync server unavailable' 
      });
      return;
    }

    logger.info('SyncService', 'Fetching from cloud...');

    try {
      const syncId = await this.getSyncId(sessionPassword);
      const apiBaseUrl = this._getApiBaseUrl();
      
      const response = await axios.get(`${apiBaseUrl}/api/sync/${syncId}`, {
        timeout: 5000
      });
      const { data: encryptedData, timestamp } = response.data; // data here is the encrypted string

      if (!encryptedData) return;

      // Check timestamp to see if we need to sync
      // Actually, we should merge. But for simplicity, if cloud is newer, we pull.
      // But "lastSyncTime" is local.
      // If cloud timestamp > lastSyncTime, we pull.
      
      // Decrypt
      // response.data might be { data: "...", timestamp: ... }
      // Wait, server returns JSON.parse(file). File contains { data, timestamp }.
      
      // response.data is the object from server
      const decrypted = await decryptData(response.data.data, sessionPassword);
      
      if (decrypted) {
        logger.info('SyncService', 'Decrypted cloud data, applying changes...');
        await this.applyCloudData(decrypted);
      }

    } catch (error) {
        const errorMessage = this._extractErrorMessage(error);
        
        if (error.response && error.response.status === 404) {
            logger.info('SyncService', 'No cloud data found.');
        } else if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
            logger.warn('SyncService', 'Cloud sync server unavailable');
            useConfigStore.getState().updateCloudSync({ 
              syncStatus: 'error', 
              lastError: 'Cloud sync server unavailable' 
            });
        } else {
            logger.error('SyncService', 'Sync from cloud failed', { error, message: errorMessage });
            useConfigStore.getState().updateCloudSync({ 
              syncStatus: 'error', 
              lastError: errorMessage 
            });
        }
    }
  }

  async applyCloudData(cloudData) {
    // 1. Apply Config
    if (cloudData.config) {
       // Merge logic? Or overwrite? 
       // ConfigStore has setState.
       // Let's overwrite for now, but preserve local keys if needed.
       useConfigStore.setState(state => ({
           ...state,
           ...cloudData.config,
           // Preserve cloudSync settings as they are local preference for enabling
           cloudSync: state.cloudSync 
       }));
    }

    // 2. Apply DB Data (Conversations & Messages)
    // Strategy: Upsert.
    // If ID exists, overwrite if cloud timestamp > local.
    // Actually, simple upsert is safer than delete-all.
    
    if (cloudData.conversations) {
       await db.transaction('rw', db.conversations, db.messages, async () => {
           // Bulk put is faster
           await db.conversations.bulkPut(cloudData.conversations);
           if (cloudData.messages) {
               await db.messages.bulkPut(cloudData.messages);
           }
       });
    }
    
    // Update sync time
    useConfigStore.getState().updateCloudSync({ lastSyncTime: Date.now() });
    
    // Reload theme etc
    useConfigStore.getState().applyTheme();
    logger.info('SyncService', 'Cloud data applied successfully');
  }

  async deleteCloudData() {
    const { sessionPassword, isAuthenticated } = useAuthStore.getState();

    if (!isAuthenticated || !sessionPassword) {
      return;
    }

    try {
      const syncId = await this.getSyncId(sessionPassword);
      const apiBaseUrl = this._getApiBaseUrl();
      
      await axios.delete(`${apiBaseUrl}/api/sync/${syncId}`);
      logger.info('SyncService', 'Cloud data deleted successfully');
    } catch (error) {
      logger.error('SyncService', 'Failed to delete cloud data', error);
      throw error;
    }
  }

  /**
   * 后端同步服务健康检查
   * @param {boolean} force - 是否强制刷新，跳过缓存
   */
  async checkProxyHealth(force = false) {
    // 性能优化：5秒内不重复进行物理健康检查，除非强制刷新
    if (!force && Date.now() - this.proxyStatus.lastCheckTime < 5000 && this.proxyStatus.lastCheckTime !== 0) {
      return this.proxyStatus.isAvailable;
    }

    const apiBaseUrl = this._getApiBaseUrl();
    // 允许空 apiBaseUrl 以支持相对路径（适配同源或代理环境）
    
    const healthCheckUrl = `${apiBaseUrl}/api/health`;
    
    try {
      const response = await axios.get(healthCheckUrl, { 
        timeout: 5000,
        validateStatus: (status) => status >= 200 && status < 300
      });
      
      // 检查响应是否有效：支持多种成功标识以适配不同后端实现（KV, MySQL, 文件系统等）
      const isSuccess = response.data && (
        response.data.status === 'ok' || 
        response.data.status === 'healthy' || 
        response.data.success === true ||
        response.data.database === 'online'
      );

      if (isSuccess) {
        this.proxyStatus = {
          isAvailable: true,
          lastCheckTime: Date.now(),
          errorCount: 0
        };
        logger.info('SyncService', `Sync health check passed: ${healthCheckUrl}`);
        return true;
      }
      
      // 增强调试日志
      const dataType = typeof response.data;
      const dataPreview = dataType === 'string' ? response.data.substring(0, 100) : JSON.stringify(response.data).substring(0, 100);
      logger.warn('SyncService', `Health check failed: Unexpected data format. URL: ${healthCheckUrl}`, {
        type: dataType,
        data: dataPreview
      });
      
      this.proxyStatus.isAvailable = false;
      return false;
    } catch (error) {
      this.proxyStatus.errorCount++;
      this.proxyStatus.lastCheckTime = Date.now();
      this.proxyStatus.isAvailable = false;
      
      // 更详细的错误日志
      let errorMsg = error.message;
      if (error.code === 'ECONNREFUSED') {
        errorMsg = `Connection refused (${healthCheckUrl})`;
      } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
        errorMsg = `Timeout (${healthCheckUrl})`;
      } else if (error.response) {
        errorMsg = `HTTP ${error.response.status} (${healthCheckUrl})`;
        // 如果有响应体，也记录下来（可能是 Cloudflare 的错误页面）
        if (error.response.data) {
           const body = typeof error.response.data === 'string' 
             ? error.response.data.substring(0, 100) 
             : JSON.stringify(error.response.data).substring(0, 100);
           errorMsg += ` - Response: ${body}`;
        }
      } else if (error.request) {
        errorMsg = `Network Error/No response (${healthCheckUrl})`;
      }
      
      logger.warn('SyncService', `Proxy health check failed: ${errorMsg}`);
      return false;
    }
    return false;
  }

  // 启动代理健康监控轮询
  startProxyHealthMonitoring() {
    if (this.proxyHealthCheckInterval) return;
    
    this.proxyHealthCheckInterval = setInterval(async () => {
      const { cloudSync } = useConfigStore.getState();
      if (!cloudSync?.enabled) {
        this.stopProxyHealthMonitoring();
        return;
      }
      
      const isHealthy = await this.checkProxyHealth();
      if (!isHealthy && cloudSync.enabled) {
        logger.warn('SyncService', 'Proxy unavailable, pausing cloud sync');
        // 暂停云同步但不自动禁用，等待代理恢复
      }
    }, 30000); // 30秒轮询
    
    logger.info('SyncService', 'Proxy health monitoring started');
  }

  // 停止代理健康监控
  stopProxyHealthMonitoring() {
    if (this.proxyHealthCheckInterval) {
      clearInterval(this.proxyHealthCheckInterval);
      this.proxyHealthCheckInterval = null;
      logger.info('SyncService', 'Proxy health monitoring stopped');
    }
  }

  // 获取代理状态(供UI使用)
  getProxyStatus() {
    return { ...this.proxyStatus };
  }

  /**
   * 生成离线加密备份文件 (.aipibox)
   */
  async exportFullBackup(password, options = {}) {
    const {
      includeSystemLogs = false,
      includePublished = true
    } = options;

    try {
      logger.info('SyncService', 'Starting full backup export');
      
      // 收集所有数据
      const allData = await collectAllSyncData({ 
        includeSystemLogs, 
        includePublished 
      });
      
      // 获取应用版本
      const appVersion = '1.0.0'; // 可以从package.json读取
      
      // 构建备份包
      const backupPackage = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        appVersion: appVersion,
        data: allData
      };
      
      // 加密整个备份包
      const encrypted = await encryptData(backupPackage, password);
      
      // 计算校验和
      const checksum = await calculateChecksum(encrypted);
      
      // 构建最终文件内容
      const fileContent = JSON.stringify({
        checksum,
        payload: encrypted
      });
      
      const blob = new Blob([fileContent], { type: 'application/json' });
      
      const stats = getDataStatistics(allData);
      logger.info('SyncService', 'Backup export completed', {
        size: formatFileSize(blob.size),
        ...stats
      });
      
      return blob;
      
    } catch (error) {
      logger.error('SyncService', 'Failed to export backup', error);
      throw error;
    }
  }

  /**
   * 从离线备份文件恢复全量数据
   */
  async importFullBackup(file, password) {
    try {
      logger.info('SyncService', 'Starting backup import');
      
      // 读取文件内容
      const fileContent = await this._readFile(file);
      const backupData = JSON.parse(fileContent);
      
      // 验证校验和
      const calculatedChecksum = await calculateChecksum(backupData.payload);
      if (calculatedChecksum !== backupData.checksum) {
        throw new Error('数据完整性校验失败');
      }
      
      logger.info('SyncService', 'Checksum validated successfully');
      
      // 解密
      const backupPackage = await decryptData(backupData.payload, password);
      
      // 版本兼容性检查
      if (!isVersionCompatible(backupPackage.version)) {
        throw new Error(`备份文件版本不兼容: ${backupPackage.version}`);
      }
      
      logger.info('SyncService', 'Version compatibility check passed');
      
      // 验证数据完整性
      const validation = validateRestoredData(backupPackage.data);
      if (!validation.valid) {
        throw new Error(`数据验证失败: ${validation.errors.join(', ')}`);
      }
      
      // 恢复数据
      await restoreAllData(backupPackage.data, { createBackup: true });
      
      const stats = getDataStatistics(backupPackage.data);
      logger.info('SyncService', 'Backup import completed successfully', stats);
      
      return {
        success: true,
        stats,
        exportDate: backupPackage.exportDate,
        appVersion: backupPackage.appVersion
      };
      
    } catch (error) {
      logger.error('SyncService', 'Failed to import backup', error);
      throw error;
    }
  }

  /**
   * 读取文件内容
   * @private
   */
  _readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  }

  // ==================== 云端同步方法 ====================

  /**
   * 加载上次同步的版本号
   * @private
   */
  _loadLastSyncVersions() {
    try {
      const saved = localStorage.getItem('aipibox_last_sync_versions');
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      logger.error('SyncService', 'Failed to load last sync versions', error);
      return {};
    }
  }

  /**
   * 保存同步版本号
   * @private
   */
  _saveLastSyncVersions() {
    try {
      localStorage.setItem('aipibox_last_sync_versions', JSON.stringify(this.lastSyncVersions));
    } catch (error) {
      logger.error('SyncService', 'Failed to save last sync versions', error);
    }
  }

  /**
   * 提取详细的错误信息
   * @param {Error} error - 错误对象
   * @returns {string} 错误信息
   * @private
   */
  _extractErrorMessage(error) {
    if (!error) return 'Unknown error';
    
    // 处理 Axios 响应错误
    if (error.response && error.response.data) {
      const data = error.response.data;
      if (typeof data === 'object') {
        return data.message || data.error || JSON.stringify(data);
      }
      return String(data);
    }
    
    // 处理 Axios 请求无响应
    if (error.request) {
      return 'No response from server. Please check your network connection.';
    }
    
    // 处理普通错误信息
    return error.message || String(error);
  }

  /**
   * 生成用户ID(基于密码派生)
   * @param {string} password - 用户密码
   * @returns {Promise<string>} 用户ID
   */
  async generateUserId(password) {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    );
    
    // 使用固定盐值确保相同密码生成相同ID
    const fixedSalt = encoder.encode('AiPiBox_Cloud_Sync_UserID_v1');
    
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: fixedSalt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      256
    );
    
    return Array.from(new Uint8Array(derivedBits))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * 获取API基础URL
   * 自动检测环境并使用相对路径，与 AI 代理保持一致
   * @private
   */
  _getApiBaseUrl() {
    const { cloudSync } = useConfigStore.getState();
    let url = cloudSync?.apiUrl;
    
    // 如果用户手动配置了URL，优先使用用户配置（向后兼容）
    if (url && url.trim()) {
      // 清理首尾空格并移除末尾的所有斜杠
      return url.trim().replace(/\/+$/, '');
    }
    
    // 否则返回空字符串，表示使用相对路径
    // 拼接时 '' + '/api/sync' = '/api/sync'，浏览器自动识别当前域名
    return '';
  }

  /**
   * 带重试的HTTP请求
   * @private
   */
  async _requestWithRetry(method, url, data = null, retries = this.cloudSyncConfig.retryCount) {
    for (let i = 0; i < retries; i++) {
      try {
        const config = {
          method,
          url,
          timeout: this.cloudSyncConfig.timeout,
          headers: {
            'Content-Type': 'application/json'
          }
        };

        if (data) {
          config.data = data;
        }

        const response = await axios(config);
        return response.data;
      } catch (error) {
        const isLastRetry = i === retries - 1;
        const isNetworkError = error.code === 'ECONNREFUSED' || 
                               error.code === 'ERR_NETWORK' || 
                               error.message === 'Network Error';

        if (isLastRetry || !isNetworkError) {
          throw error;
        }

        // 等待后重试
        await new Promise(resolve => 
          setTimeout(resolve, this.cloudSyncConfig.retryDelay * (i + 1))
        );
        logger.warn('SyncService', `Request failed, retrying (${i + 1}/${retries})...`);
      }
    }
  }

  /**
   * 上传数据到云端
   * @param {string} userId - 用户ID
   * @param {string} dataType - 数据类型
   * @param {any} data - 原始数据
   * @param {string} password - 加密密码
   */
  async uploadToCloud(userId, dataType, data, password) {
    try {
      const apiBaseUrl = this._getApiBaseUrl();

      // 加密数据
      const encryptedData = await encryptData(data, password);
      
      // 计算校验和
      const checksum = await calculateChecksum(encryptedData);
      
      // 生成版本号(时间戳)
      const version = Date.now();

      // 上传
      const result = await this._requestWithRetry(
        'POST',
        `${apiBaseUrl}/api/sync/upload`,
        {
          userId,
          dataType,
          encryptedData,
          version,
          checksum
        }
      );

      // 保存版本号
      this.lastSyncVersions[dataType] = result.version;
      this._saveLastSyncVersions();

      logger.info('SyncService', `Uploaded ${dataType} to cloud`, { version: result.version });
      return result;
    } catch (error) {
      const errorMessage = this._extractErrorMessage(error);
      logger.error('SyncService', `Failed to upload ${dataType}`, { error, message: errorMessage });
      throw new Error(errorMessage);
    }
  }

  /**
   * 从云端下载数据
   * @param {string} userId - 用户ID
   * @param {string} dataType - 数据类型(可选)
   * @param {string} password - 解密密码
   * @param {number} sinceVersion - 只下载此版本之后的数据(可选)
   */
  async downloadFromCloud(userId, password, dataType = null, sinceVersion = null) {
    try {
      const apiBaseUrl = this._getApiBaseUrl();

      // 构建查询参数
      const params = new URLSearchParams({ userId });
      if (dataType) params.append('dataType', dataType);
      if (sinceVersion) params.append('sinceVersion', sinceVersion.toString());

      // 下载
      const result = await this._requestWithRetry(
        'GET',
        `${apiBaseUrl}/api/sync/download?${params.toString()}`
      );

      // 解密数据
      const decryptedData = [];
      for (const item of result.data) {
        try {
          const decrypted = await decryptData(item.encryptedData, password);
          
          // 验证校验和
          if (item.checksum) {
            const calculatedChecksum = await calculateChecksum(item.encryptedData);
            if (calculatedChecksum !== item.checksum) {
              logger.warn('SyncService', `Checksum mismatch for ${item.dataType}`);
              continue;
            }
          }

          decryptedData.push({
            dataType: item.dataType,
            data: decrypted,
            version: item.version,
            timestamp: item.timestamp
          });

          // 更新本地版本号
          this.lastSyncVersions[item.dataType] = item.version;
        } catch (error) {
          logger.error('SyncService', `Failed to decrypt ${item.dataType}`, error);
        }
      }

      this._saveLastSyncVersions();
      logger.info('SyncService', 'Downloaded data from cloud', { count: decryptedData.length });
      return decryptedData;
    } catch (error) {
      const errorMessage = this._extractErrorMessage(error);
      logger.error('SyncService', 'Failed to download from cloud', { error, message: errorMessage });
      throw new Error(errorMessage);
    }
  }

  /**
   * 删除云端数据
   * @param {string} userId - 用户ID
   * @param {string} dataType - 数据类型(可选,不指定则删除所有)
   */
  async deleteFromCloud(userId, dataType = null) {
    try {
      const apiBaseUrl = this._getApiBaseUrl();

      const result = await this._requestWithRetry(
        'DELETE',
        `${apiBaseUrl}/api/sync/delete`,
        { userId, dataType }
      );

      // 清除本地版本号
      if (dataType) {
        delete this.lastSyncVersions[dataType];
      } else {
        this.lastSyncVersions = {};
      }
      this._saveLastSyncVersions();

      logger.info('SyncService', 'Deleted data from cloud', { dataType: dataType || 'all' });
      return result;
    } catch (error) {
      const errorMessage = this._extractErrorMessage(error);
      logger.error('SyncService', 'Failed to delete from cloud', { error, message: errorMessage });
      throw new Error(errorMessage);
    }
  }

  /**
   * 全量同步所有数据到云端
   * @param {string} password - 用户密码
   */
  async syncAllDataToCloud(password) {
    try {
      logger.info('SyncService', 'Starting full sync to cloud');
      
      const userId = await this.generateUserId(password);
      const allData = await collectAllSyncData({
        includeSystemLogs: false,
        includePublished: true
      });

      const dataTypes = [
        { type: 'config', data: allData.config },
        { type: 'conversations', data: allData.conversations },
        { type: 'messages', data: allData.messages },
        { type: 'images', data: allData.images },
        { type: 'published', data: allData.published },
        { type: 'knowledgeBases', data: allData.knowledgeBases }
      ];

      const results = [];
      for (const { type, data } of dataTypes) {
        if (data && (Array.isArray(data) ? data.length > 0 : Object.keys(data).length > 0)) {
          try {
            const result = await this.uploadToCloud(userId, type, data, password);
            results.push({ type, success: true, version: result.version });
          } catch (error) {
            results.push({ type, success: false, error: error.message });
          }
        }
      }

      logger.info('SyncService', 'Full sync to cloud completed', { results });
      return results;
    } catch (error) {
      logger.error('SyncService', 'Full sync to cloud failed', error);
      throw error;
    }
  }

  /**
   * 增量同步到云端
   * @param {string} password - 用户密码
   * @param {Array<string>} dataTypes - 要同步的数据类型列表
   */
  async syncIncrementalToCloud(password, dataTypes = ['conversations', 'messages']) {
    try {
      logger.info('SyncService', 'Starting incremental sync to cloud', { dataTypes });
      
      const userId = await this.generateUserId(password);
      const results = [];

      for (const dataType of dataTypes) {
        try {
          let data;
          const lastVersion = this.lastSyncVersions[dataType] || 0;

          // 根据数据类型获取数据
          switch (dataType) {
            case 'config':
              data = {
                providers: useConfigStore.getState().providers,
                defaultModels: useConfigStore.getState().defaultModels,
                general: useConfigStore.getState().general,
                proxy: useConfigStore.getState().proxy,
                searchSettings: useConfigStore.getState().searchSettings,
                conversationPresets: useConfigStore.getState().conversationPresets,
                conversationSettings: useConfigStore.getState().conversationSettings
              };
              break;
            case 'conversations':
              data = await db.conversations.toArray();
              break;
            case 'messages':
              data = await db.messages.toArray();
              break;
            case 'images':
              data = await db.images.toArray();
              break;
            case 'published':
              data = await db.published.toArray();
              break;
            case 'knowledgeBases':
              const { useKnowledgeBaseStore } = await import('../store/useKnowledgeBaseStore');
              data = useKnowledgeBaseStore.getState().knowledgeBases || [];
              break;
            default:
              logger.warn('SyncService', `Unknown data type: ${dataType}`);
              continue;
          }

          // 如果数据非空,上传
          if (data && (Array.isArray(data) ? data.length > 0 : Object.keys(data).length > 0)) {
            const result = await this.uploadToCloud(userId, dataType, data, password);
            results.push({ type: dataType, success: true, version: result.version });
          }
        } catch (error) {
          results.push({ type: dataType, success: false, error: error.message });
        }
      }

      logger.info('SyncService', 'Incremental sync to cloud completed', { results });
      return results;
    } catch (error) {
      logger.error('SyncService', 'Incremental sync to cloud failed', error);
      throw error;
    }
  }

  /**
   * 从云端同步所有数据
   * @param {string} password - 用户密码
   */
  async syncAllDataFromCloud(password) {
    try {
      logger.info('SyncService', 'Starting full sync from cloud');
      
      const userId = await this.generateUserId(password);
      const cloudData = await this.downloadFromCloud(userId, password);

      for (const item of cloudData) {
        await this._applyCloudDataByType(item.dataType, item.data);
      }

      logger.info('SyncService', 'Full sync from cloud completed');
      return cloudData;
    } catch (error) {
      logger.error('SyncService', 'Full sync from cloud failed', error);
      throw error;
    }
  }

  /**
   * 应用云端数据(按类型)
   * @private
   */
  async _applyCloudDataByType(dataType, data) {
    try {
      switch (dataType) {
        case 'config':
          useConfigStore.setState(state => ({
            ...state,
            ...data,
            cloudSync: state.cloudSync // 保留本地同步设置
          }));
          break;
        case 'conversations':
          if (Array.isArray(data)) {
            await db.conversations.bulkPut(data);
          }
          break;
        case 'messages':
          if (Array.isArray(data)) {
            await db.messages.bulkPut(data);
          }
          break;
        case 'images':
          if (Array.isArray(data)) {
            await db.images.bulkPut(data);
          }
          break;
        case 'published':
          if (Array.isArray(data)) {
            await db.published.bulkPut(data);
          }
          break;
        case 'knowledgeBases':
          const { useKnowledgeBaseStore } = await import('../store/useKnowledgeBaseStore');
          useKnowledgeBaseStore.setState({ knowledgeBases: data || [] });
          break;
        default:
          logger.warn('SyncService', `Unknown data type for apply: ${dataType}`);
      }
      logger.info('SyncService', `Applied cloud data for ${dataType}`);
    } catch (error) {
      logger.error('SyncService', `Failed to apply cloud data for ${dataType}`, error);
      throw error;
    }
  }

  /**
   * 智能同步：带有冲突检测与合并策略
   */
  async syncWithConflictResolution(password, strategy = ResolutionStrategy.TIMESTAMP) {
    try {
      logger.info('SyncService', 'Starting sync with conflict resolution');
      
      const userId = await this.generateUserId(password);
      
      // 更新同步状态
      useConfigStore.setState(state => ({
        cloudSync: {
          ...state.cloudSync,
          syncStatus: 'syncing',
          lastError: null
        }
      }));

      // 1. 获取本地数据
      const localConversations = await db.conversations.toArray();
      const localMessages = await db.messages.toArray();

      // 2. 下载云端数据
      const cloudData = await this.downloadFromCloud(userId, password);

      // 3. 检测冲突
      const conflicts = {
        conversations: [],
        messages: []
      };

      for (const item of cloudData) {
        if (item.dataType === 'conversations' && Array.isArray(item.data)) {
          const itemConflicts = detectConflicts(localConversations, item.data);
          conflicts.conversations.push(...itemConflicts);
        } else if (item.dataType === 'messages' && Array.isArray(item.data)) {
          const itemConflicts = detectConflicts(localMessages, item.data);
          conflicts.messages.push(...itemConflicts);
        }
      }

      const totalConflicts = conflicts.conversations.length + conflicts.messages.length;
      logger.info('SyncService', `Detected ${totalConflicts} conflicts`);

      // 4. 解决冲突
      if (totalConflicts > 0) {
        if (strategy === ResolutionStrategy.MANUAL) {
          // 手动解决需要返回冲突信息给UI
          useConfigStore.setState(state => ({
            cloudSync: {
              ...state.cloudSync,
              syncStatus: 'error',
              lastError: 'Conflicts detected, manual resolution required'
            }
          }));
          return {
            success: false,
            conflicts,
            requiresManualResolution: true
          };
        }

        // 自动解决
        const resolvedConversations = resolveConflicts(conflicts.conversations, strategy);
        const resolvedMessages = resolveConflicts(conflicts.messages, strategy);

        // 应用解决后的数据
        for (const resolved of resolvedConversations) {
          await db.conversations.put(resolved.data);
        }
        for (const resolved of resolvedMessages) {
          await db.messages.put(resolved.data);
        }

        logger.info('SyncService', `Resolved and applied ${totalConflicts} conflicts`);
      }

      // 5. 应用无冲突的数据
      for (const item of cloudData) {
        await this._applyCloudDataByType(item.dataType, item.data);
      }

      // 6. 上传本地数据
      await this.syncAllDataToCloud(password);

      // 更新同步状态
      useConfigStore.setState(state => ({
        cloudSync: {
          ...state.cloudSync,
          syncStatus: 'success',
          lastSyncTime: Date.now(),
          lastError: null
        }
      }));

      logger.info('SyncService', 'Sync with conflict resolution completed successfully');
      return {
        success: true,
        conflicts: totalConflicts,
        resolved: totalConflicts,
        strategy
      };

    } catch (error) {
      const errorMessage = this._extractErrorMessage(error);
      logger.error('SyncService', 'Sync with conflict resolution failed', { error, message: errorMessage });
      
      // 更新同步状态
      useConfigStore.setState(state => ({
        cloudSync: {
          ...state.cloudSync,
          syncStatus: 'error',
          lastError: errorMessage
        }
      }));

      throw new Error(errorMessage);
    }
  }
}

export const syncService = new SyncService();
