import { db } from '../db';
import { useConfigStore } from '../store/useConfigStore';
import { encryptData, decryptData, hashPassword } from '../utils/crypto';
import { logger } from './logger';
import { useTranslation } from '../i18n';
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
    this.pollingInterval = null;
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

    // 动态获取 AuthStore
    let AuthStore;
    try {
      const authModule = await import('../store/useAuthStore');
      AuthStore = authModule.useAuthStore;
    } catch (e) {
      logger.error('SyncService', 'Failed to dynamic import useAuthStore', e);
    }

    this.initialized = true;
    logger.info('SyncService', 'Initializing...');
    
    // Subscribe to stores to trigger sync
    if (ConfigStore && typeof ConfigStore.subscribe === 'function') {
      ConfigStore.subscribe(async (state, prevState) => {
        // 核心机制：当云同步开关被手动开启时，立即触发一次全量同步(包含拉取)
        // 这样新设备在开启同步后能立即获取云端数据，无需等待本地变动
        if (state.cloudSync?.enabled && !prevState.cloudSync?.enabled) {
          logger.info('SyncService', 'Cloud sync enabled, triggering initial sync...');
          
          // 开启健康检查和轮询
          this.startProxyHealthMonitoring();
          this.startCloudPolling();

          if (AuthStore) {
            const { sessionPassword } = AuthStore.getState();
            if (sessionPassword) {
              this.syncWithConflictResolution(sessionPassword).catch(err => {
                logger.error('SyncService', 'Initial sync failed:', err);
              });
            }
          }
          return;
        }

        // 当关闭同步时，停止相关计时器
        if (!state.cloudSync?.enabled && prevState.cloudSync?.enabled) {
          this.stopProxyHealthMonitoring();
          this.stopCloudPolling();
        }

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
      // 启动定时轮询
      this.startCloudPolling();
      // 延迟初次从云端同步，让应用先完成本地加载
      setTimeout(() => this.syncFromCloud(), 2000);
    }
  }

  /**
   * 计算同步标识符 (Sync ID)
   * 基于主密码派生出确定的唯一标识，用于在多端识别同一用户
   */
  async getSyncId(password) {
    if (!password) return null;
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
    
    // 动态获取 AuthStore 以避免循环依赖
    let AuthStore;
    try {
      const authModule = await import('../store/useAuthStore');
      AuthStore = authModule.useAuthStore;
    } catch (e) {
      return;
    }

    const { sessionPassword, isAuthenticated } = AuthStore.getState();
    const { cloudSync } = useConfigStore.getState();

    if (!isAuthenticated || !sessionPassword || !cloudSync?.enabled) {
      return;
    }

    // 执行同步前强制进行实时健康检查，确保不被旧的缓存错误阻断
    const isSyncAvailable = await this.checkProxyHealth(true);
    if (!isSyncAvailable) {
      // 仅在真的离线时记录 warning
      logger.warn('SyncService', 'Cannot sync: cloud sync server is not available');
      useConfigStore.getState().updateCloudSync({ 
        syncStatus: 'error', 
        lastError: 'Sync server unavailable' 
      });
      return;
    }

    this.isSyncing = true;
    logger.debug('SyncService', 'Starting sync to cloud...');

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
      useConfigStore.getState().updateCloudSync({ 
        lastSyncTime: Date.now(),
        syncStatus: 'success'
      });
      logger.debug('SyncService', 'Sync to cloud completed');

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
    // 动态获取 AuthStore
    let AuthStore;
    try {
      const authModule = await import('../store/useAuthStore');
      AuthStore = authModule.useAuthStore;
    } catch (e) {
      return;
    }

    const { sessionPassword, isAuthenticated } = AuthStore.getState();
    const { cloudSync } = useConfigStore.getState();

    if (!isAuthenticated || !sessionPassword || !cloudSync?.enabled) {
      return;
    }

    // 执行同步前强制进行实时健康检查
    const isSyncAvailable = await this.checkProxyHealth(true);
    if (!isSyncAvailable) {
      logger.warn('SyncService', 'Cannot sync from cloud: sync server unavailable');
      return;
    }

    logger.debug('SyncService', 'Fetching from cloud...');

    try {
      const syncId = await this.getSyncId(sessionPassword);
      const apiBaseUrl = this._getApiBaseUrl();
      
      const response = await axios.get(`${apiBaseUrl}/api/sync/${syncId}`, {
        timeout: 5000
      });
      const { data: encryptedData, timestamp } = response.data; // data here is the encrypted string

      if (!encryptedData) return;

      // Decrypt
      const decrypted = await decryptData(response.data.data, sessionPassword);
      
      if (decrypted) {
        logger.debug('SyncService', 'Decrypted cloud data, applying changes...');
        await this.applyCloudData(decrypted);
      }

    } catch (error) {
        const errorMessage = this._extractErrorMessage(error);
        
        if (error.response && error.response.status === 404) {
            logger.debug('SyncService', 'No cloud data found.');
        } else if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
            // 静默
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
    
    // Update sync time and status
    useConfigStore.getState().updateCloudSync({ 
      lastSyncTime: Date.now(),
      syncStatus: 'success'
    });
    
    // Reload theme etc
    useConfigStore.getState().applyTheme();
    
    logger.info('SyncService', 'Cloud data applied successfully');
  }

  async deleteCloudData() {
    // 动态获取 AuthStore
    let AuthStore;
    try {
      const authModule = await import('../store/useAuthStore');
      AuthStore = authModule.useAuthStore;
    } catch (e) {
      return;
    }

    const { sessionPassword, isAuthenticated } = AuthStore.getState();

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
        const wasAvailable = this.proxyStatus.isAvailable;
        this.proxyStatus = {
          isAvailable: true,
          lastCheckTime: Date.now(),
          errorCount: 0
        };
        
        // 降低日志频率：仅在状态从不可用变为可用时记录
        if (!wasAvailable) {
           logger.info('SyncService', `Sync server is now online: ${healthCheckUrl}`);
        }
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
      const wasAvailable = this.proxyStatus.isAvailable;
      this.proxyStatus.errorCount++;
      this.proxyStatus.lastCheckTime = Date.now();
      this.proxyStatus.isAvailable = false;
      
      // 仅在状态变更时记录错误日志，避免刷屏
      if (wasAvailable) {
        logger.warn('SyncService', `Sync server went offline: ${error.message}`);
      }
      return false;
    }
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
      
      await this.checkProxyHealth();
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

  /**
   * 启动云端定时轮询
   * 每 5 分钟检查一次云端更新
   */
  startCloudPolling() {
    if (this.pollingInterval) return;
    
    // 5 分钟轮询一次
    this.pollingInterval = setInterval(async () => {
      const { cloudSync } = useConfigStore.getState();
      if (!cloudSync?.enabled || !cloudSync?.autoSync) {
        this.stopCloudPolling();
        return;
      }

      // 如果当前正在同步中，跳过本次轮询
      if (this.isSyncing) return;

      // 执行静默同步(拉取)
      try {
        await this.syncFromCloud();
      } catch (e) {
        // 静默处理轮询错误
      }
    }, 1000 * 60 * 5);
    
    logger.info('SyncService', 'Cloud polling started (5min interval)');
  }

  /**
   * 停止云端定时轮询
   */
  stopCloudPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      logger.info('SyncService', 'Cloud polling stopped');
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
        const { t } = useTranslation();
        throw new Error(t('services.sync.checksumFailed'));
      }
      
      logger.info('SyncService', 'Checksum validated successfully');
      
      // 解密
      const backupPackage = await decryptData(backupData.payload, password);
      
      // 版本兼容性检查
      if (!isVersionCompatible(backupPackage.version)) {
        const { t } = useTranslation();
        throw new Error(t('services.sync.versionIncompatible', { version: backupPackage.version }));
      }
      
      logger.info('SyncService', 'Version compatibility check passed');
      
      // 验证数据完整性
      const validation = validateRestoredData(backupPackage.data);
      if (!validation.valid) {
        const { t } = useTranslation();
        throw new Error(t('services.sync.validationFailed', { errors: validation.errors.join(', ') }));
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

  // ==================== 云端同步辅助方法 ====================

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
   * 智能同步：带有冲突检测与合并策略
   * 适配全量同步接口，执行：拉取 -> 合并 -> 推送
   */
  async syncWithConflictResolution(password, strategy = ResolutionStrategy.TIMESTAMP) {
    try {
      logger.info('SyncService', 'Starting sync with conflict resolution');
      
      const syncId = await this.getSyncId(password);
      if (!syncId) throw new Error('Failed to generate sync ID');

      // 更新同步状态
      useConfigStore.getState().updateCloudSync({
        syncStatus: 'syncing',
        lastError: null
      });

      // 1. 获取 API 基础 URL
      const apiBaseUrl = this._getApiBaseUrl();

      // 2. 尝试从云端下载全量数据
      let cloudPayload = null;
      try {
        const response = await axios.get(`${apiBaseUrl}/api/sync/${syncId}`, {
          timeout: 10000
        });
        
        if (response.data && response.data.data) {
          const decrypted = await decryptData(response.data.data, password);
          if (decrypted) {
            cloudPayload = decrypted;
            logger.debug('SyncService', 'Successfully downloaded and decrypted cloud data for merging');
          }
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          logger.info('SyncService', 'No existing cloud data found, will perform initial upload');
        } else {
          throw error; // 其他错误（如网络问题）向上抛出
        }
      }

      // 3. 执行冲突检测与合并
      if (cloudPayload) {
        const localConversations = await db.conversations.toArray();
        const localMessages = await db.messages.toArray();

        // 检测冲突
        const convConflicts = detectConflicts(localConversations, cloudPayload.conversations || []);
        const msgConflicts = detectConflicts(localMessages, cloudPayload.messages || []);
        
        const totalConflicts = convConflicts.length + msgConflicts.length;
        logger.debug('SyncService', `Detected ${totalConflicts} conflicts during merge`);

        if (totalConflicts > 0) {
          // 自动解决冲突
          const resolvedConversations = resolveConflicts(convConflicts, strategy);
          const resolvedMessages = resolveConflicts(msgConflicts, strategy);

          // 应用解决后的数据到本地数据库
          await db.transaction('rw', db.conversations, db.messages, async () => {
            for (const resolved of resolvedConversations) {
              await db.conversations.put(resolved.data);
            }
            for (const resolved of resolvedMessages) {
              await db.messages.put(resolved.data);
            }
          });
          logger.info('SyncService', `Resolved and applied ${totalConflicts} conflicts using ${strategy}`);
        }

        // 应用云端存在但本地不存在的数据，或云端更新的数据（非冲突部分）
        // 简单起见，对云端数据执行 bulkPut，Dexie 会根据主键自动处理
        await db.transaction('rw', db.conversations, db.messages, async () => {
          if (cloudPayload.conversations) {
            await db.conversations.bulkPut(cloudPayload.conversations);
          }
          if (cloudPayload.messages) {
            await db.messages.bulkPut(cloudPayload.messages);
          }
        });

        // 应用配置合并（可选，通常配置以本地为准或简单覆盖）
        if (cloudPayload.config) {
          useConfigStore.setState(state => ({
            ...state,
            ...cloudPayload.config,
            cloudSync: state.cloudSync // 保持本地同步开关状态
          }));
        }
      }

      // 4. 将合并后的最新数据推送到云端
      await this.syncToCloud();

      // 5. 更新同步结果状态
      useConfigStore.getState().updateCloudSync({
        syncStatus: 'success',
        lastSyncTime: Date.now(),
        lastError: null
      });

      logger.info('SyncService', 'Sync with conflict resolution completed successfully');
      return {
        success: true,
        strategy
      };

    } catch (error) {
      const errorMessage = this._extractErrorMessage(error);
      logger.error('SyncService', 'Sync with conflict resolution failed', { error, message: errorMessage });
      
      // 更新同步状态
      useConfigStore.getState().updateCloudSync({
        syncStatus: 'error',
        lastError: errorMessage
      });

      throw new Error(errorMessage);
    }
  }
}

export const syncService = new SyncService();
