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
  init() {
    if (this.initialized) return;
    this.initialized = true;

    logger.info('SyncService', 'Initializing...');
    
    // Subscribe to stores to trigger sync
    useConfigStore.subscribe((state, prevState) => {
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

    // 监听数据库变化以触发自动同步
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
    const { cloudSync, proxy } = useConfigStore.getState();

    if (!isAuthenticated || !sessionPassword || !cloudSync?.enabled) {
      return;
    }

    // 检查代理服务是否可用
    if (!proxy.enabled) {
      logger.error('SyncService', 'Cannot sync: proxy is not enabled');
      return;
    }

    const isProxyAvailable = await this.checkProxyHealth();
    if (!isProxyAvailable) {
      logger.error('SyncService', 'Cannot sync: proxy server is not available');
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
            // Exclude proxy settings to avoid locking out if bad proxy syncs? 
            // Maybe exclude proxy, or include. Let's include.
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
      
      // Send
      const baseUrl = proxy.enabled && proxy.url ? proxy.url.replace('/api/proxy', '') : 'http://localhost:5000';
      // Note: If using proxy.url, we need to handle it. 
      // Assuming localhost server is running on 5000. 
      // If deployed, this URL needs to be configurable or relative.
      // For now, hardcode localhost:5000 or use relative if same origin.
      
      await axios.post('http://localhost:5000/api/sync', {
        id: syncId,
        data: encryptedData,
        timestamp: payload.timestamp
      }, {
        timeout: 3000 // 3秒超时
      });

      // Update last sync time
      useConfigStore.getState().updateCloudSync({ lastSyncTime: Date.now() });
      logger.info('SyncService', 'Sync to cloud completed');

    } catch (error) {
      // 网络错误时，静默处理，避免频繁报错
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        logger.warn('SyncService', 'Cloud sync server unavailable, will retry later');
        // 自动禁用云同步，避免持续失败
        useConfigStore.getState().updateCloudSync({ enabled: false });
      } else {
        logger.error('SyncService', 'Sync to cloud failed', error);
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
    const { cloudSync, proxy } = useConfigStore.getState();

    if (!isAuthenticated || !sessionPassword || !cloudSync?.enabled) {
      return;
    }

    // 检查代理服务是否可用
    if (!proxy.enabled) {
      logger.error('SyncService', 'Cannot sync from cloud: proxy is not enabled');
      return;
    }

    const isProxyAvailable = await this.checkProxyHealth();
    if (!isProxyAvailable) {
      logger.error('SyncService', 'Cannot sync from cloud: proxy server is not available');
      return;
    }

    logger.info('SyncService', 'Fetching from cloud...');

    try {
      const syncId = await this.getSyncId(sessionPassword);
      
      const response = await axios.get(`http://localhost:5000/api/sync/${syncId}`, {
        timeout: 3000 // 3秒超时
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
        if (error.response && error.response.status === 404) {
            logger.info('SyncService', 'No cloud data found.');
        } else if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
            logger.warn('SyncService', 'Cloud sync server unavailable');
            // 自动禁用云同步，避免持续失败
            useConfigStore.getState().updateCloudSync({ enabled: false });
        } else {
            logger.error('SyncService', 'Sync from cloud failed', error);
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
    const { proxy } = useConfigStore.getState();

    if (!isAuthenticated || !sessionPassword) {
      return;
    }

    try {
      const syncId = await this.getSyncId(sessionPassword);
      const baseUrl = proxy.enabled && proxy.url ? proxy.url.replace('/api/proxy', '') : 'http://localhost:5000';
      
      await axios.delete(`${baseUrl}/api/sync/${syncId}`);
      logger.info('SyncService', 'Cloud data deleted successfully');
    } catch (error) {
      logger.error('SyncService', 'Failed to delete cloud data', error);
      throw error;
    }
  }

  /**
   * 后端代理健康检查
   */
  async checkProxyHealth() {
    // 性能优化：5秒内不重复进行物理健康检查
    if (Date.now() - this.proxyStatus.lastCheckTime < 5000 && this.proxyStatus.lastCheckTime !== 0) {
      return this.proxyStatus.isAvailable;
    }

    const { proxy } = useConfigStore.getState();
    
    // 使用环境检测工具获取正确的代理URL
    let healthCheckUrl;
    try {
      const { getProxyApiUrl, detectPlatform, Platform } = await import('../utils/envDetect.js');
      const platform = detectPlatform();
      const proxyUrl = getProxyApiUrl();
      
      // 根据平台和代理URL构建健康检查URL
      if (proxyUrl.startsWith('http')) {
        // 完整URL（本地开发），如 http://localhost:5000/api/proxy
        const url = new URL(proxyUrl);
        healthCheckUrl = `${url.protocol}//${url.host}/api/health`;
      } else {
        // 相对路径（生产环境），如 /api/ai-proxy 或 /functions/ai-proxy
        // 对于生产环境，我们直接假设代理可用，因为它们是无服务器函数
        // 只在本地环境进行实际的健康检查
        if (platform === Platform.LOCAL) {
          healthCheckUrl = `${window.location.origin}/api/health`;
        } else {
          // 生产环境：Vercel/Netlify/Cloudflare
          // 这些平台的函数总是可用的，不需要健康检查
          this.proxyStatus = {
            isAvailable: true,
            lastCheckTime: Date.now(),
            errorCount: 0
          };
          logger.debug('SyncService', `Production platform detected (${platform}), assuming proxy is available`);
          return true;
        }
      }
    } catch (error) {
      // 如果环境检测失败，使用配置或默认值
      logger.warn('SyncService', 'Failed to detect environment, using fallback health check');
      if (proxy.cloudUrl) {
        try {
          const url = new URL(proxy.cloudUrl);
          healthCheckUrl = `${url.protocol}//${url.host}/api/health`;
        } catch (e) {
          healthCheckUrl = `${window.location.origin}/api/health`;
        }
      } else if (proxy.url) {
        healthCheckUrl = proxy.url.replace('/api/proxy', '/api/health');
      } else {
        healthCheckUrl = 'http://localhost:5000/api/health';
      }
    }
    
    try {
      const response = await axios.get(healthCheckUrl, { 
        timeout: 5000,
        validateStatus: (status) => status >= 200 && status < 300
      });
      
      // 检查响应是否有效
      if (response.data && (response.data.status === 'ok' || response.data.status === 'healthy' || response.data.version)) {
        this.proxyStatus = {
          isAvailable: true,
          lastCheckTime: Date.now(),
          errorCount: 0
        };
        logger.info('SyncService', `Proxy health check passed (${healthCheckUrl})`);
        return true;
      }
    } catch (error) {
      this.proxyStatus.errorCount++;
      this.proxyStatus.lastCheckTime = Date.now();
      this.proxyStatus.isAvailable = false;
      
      // 更详细的错误日志
      if (error.code === 'ECONNREFUSED') {
        logger.warn('SyncService', `Proxy health check failed: Connection refused (${healthCheckUrl})`);
      } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
        logger.warn('SyncService', `Proxy health check failed: Timeout (${healthCheckUrl})`);
      } else if (error.response) {
        logger.warn('SyncService', `Proxy health check failed: HTTP ${error.response.status} (${healthCheckUrl})`);
      } else {
        logger.warn('SyncService', `Proxy health check failed: ${error.message} (${healthCheckUrl})`);
      }
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
   * @private
   */
  _getApiBaseUrl() {
    const { cloudSync } = useConfigStore.getState();
    return cloudSync?.apiUrl || this.cloudSyncConfig.apiBaseUrl || '';
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
      if (!apiBaseUrl) {
        throw new Error('未配置云端同步API地址');
      }

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
      logger.error('SyncService', `Failed to upload ${dataType}`, error);
      throw error;
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
      if (!apiBaseUrl) {
        throw new Error('未配置云端同步API地址');
      }

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
      logger.error('SyncService', 'Failed to download from cloud', error);
      throw error;
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
      if (!apiBaseUrl) {
        throw new Error('未配置云端同步API地址');
      }

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
      logger.error('SyncService', 'Failed to delete from cloud', error);
      throw error;
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
      logger.error('SyncService', 'Sync with conflict resolution failed', error);
      
      // 更新同步状态
      useConfigStore.setState(state => ({
        cloudSync: {
          ...state.cloudSync,
          syncStatus: 'error',
          lastError: error.message
        }
      }));

      throw error;
    }
  }
}

export const syncService = new SyncService();
