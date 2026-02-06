/**
 * 数据同步服务
 * 负责本地数据与云端存储之间的双向同步、备份导出/导入及冲突解决。
 */

import { db } from '../db';
import { useConfigStore } from '../store/useConfigStore';
import { encryptData, decryptData, hashPassword } from '../utils/crypto';
import { logger } from './logger';
import { useI18nStore } from '../i18n';
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
import { SYNC_CONFIG } from '../utils/constants';

class SyncService {
  constructor() {
    this.isSyncing = false;
    this.initialized = false;
    this.hasSyncedOnce = false;
    this.syncInterval = null;
    this.debouncedSync = this.debounce(this.syncToCloud.bind(this), SYNC_CONFIG.DEBOUNCE_WAIT);
    this.proxyHealthCheckInterval = null;
    this.proxyStatus = {
      isAvailable: false,
      lastCheckTime: 0,
      errorCount: 0
    };
    this.pollingInterval = null;
    this.cloudSyncConfig = {
      apiBaseUrl: '', 
      retryCount: SYNC_CONFIG.RETRY_COUNT,
      retryDelay: SYNC_CONFIG.RETRY_DELAY,
      timeout: SYNC_CONFIG.TIMEOUT
    };
    this.lastSyncVersions = this._loadLastSyncVersions();
  }

  /**
   * 简易防抖器
   * @param {Function} func - 待执行函数
   * @param {number} wait - 等待毫秒数
   * @returns {Function} 防抖处理后的函数
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
   * 建立 Store 订阅，监听核心数据变更并触发自动同步。
   */
  async init() {
    if (this.initialized) return;

    let ConfigStore = useConfigStore;
    if (!ConfigStore) {
      const storeModule = await import('../store/useConfigStore');
      ConfigStore = storeModule.useConfigStore;
    }

    if (!ConfigStore) {
      logger.error('SyncService', 'Failed to initialize: useConfigStore is undefined');
      return;
    }

    let AuthStore;
    try {
      const authModule = await import('../store/useAuthStore');
      AuthStore = authModule.useAuthStore;
    } catch (e) {
      logger.error('SyncService', 'Failed to dynamic import useAuthStore', e);
    }

    this.initialized = true;
    logger.info('SyncService', 'Initializing...');
    
    if (ConfigStore && typeof ConfigStore.subscribe === 'function') {
      ConfigStore.subscribe(async (state, prevState) => {
        if (state.cloudSync?.enabled && !prevState.cloudSync?.enabled) {
          logger.info('SyncService', 'Cloud sync enabled, triggering initial sync...');
          
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

        if (state.cloudSync?.enabled && prevState.cloudSync?.syncImages === true && state.cloudSync?.syncImages === false) {
          logger.info('SyncService', 'Image sync disabled, triggering cleanup sync...');
          if (AuthStore) {
            const { sessionPassword } = AuthStore.getState();
            if (sessionPassword) {
              this.syncToCloud(true);
            }
          }
        }

        if (!state.cloudSync?.enabled && prevState.cloudSync?.enabled) {
          this.stopProxyHealthMonitoring();
          this.stopCloudPolling();
        }

        if (state.cloudSync?.enabled && state.cloudSync?.autoSync) {
          const importantKeys = ['providers', 'defaultModels', 'general', 'proxy', 'conversationPresets', 'cloudSync'];
          const hasChanged = importantKeys.some(key => {
            if (key === 'cloudSync') {
              return state.cloudSync?.syncImages !== prevState.cloudSync?.syncImages;
            }
            return JSON.stringify(state[key]) !== JSON.stringify(prevState[key]);
          });
          
          if (hasChanged) {
            this.debouncedSync();
          }
        }
      });
    }

    try {
      if (db.on) {
         db.on('changes', (changes) => {
           const config = useConfigStore.getState();
           if (config.cloudSync?.enabled && config.cloudSync?.autoSync) {
              const relevantTables = ['conversations', 'messages', 'images', 'knowledgeBases'];
              const relevant = changes.some(c => relevantTables.includes(c.table));
              if (relevant) {
                 this.debouncedSync();
              }
           }
         });
      }
    } catch (e) {
      logger.warn('SyncService', 'Database observer not available, auto-sync on DB changes disabled');
    }

    const config = useConfigStore.getState();
    if (config.cloudSync?.enabled) {
      this.startProxyHealthMonitoring();
      this.startCloudPolling();
      setTimeout(() => this.syncFromCloud(), 2000);
    }
  }

  /**
   * 计算同步标识符 (Sync ID)
   * @param {string} password - 用户主密码
   * @returns {Promise<string|null>} 同步 ID
   */
  async getSyncId(password) {
    if (!password) return null;
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    );
    
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
   * @param {boolean} force - 是否强制推送
   */
  async syncToCloud(force = false) {
    if (this.isSyncing) return;

    if (!this.hasSyncedOnce && !force) {
      logger.info('SyncService', 'Not synced with cloud yet. Upgrading to conflict resolution sync to prevent data loss.');
      let AuthStore;
      try {
        const authModule = await import('../store/useAuthStore');
        AuthStore = authModule.useAuthStore;
      } catch (e) {
        return;
      }
      const { sessionPassword } = AuthStore.getState();
      if (sessionPassword) {
        return this.syncWithConflictResolution(sessionPassword);
      }
      return;
    }
    
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

    const isSyncAvailable = await this.checkProxyHealth(true);
    if (!isSyncAvailable) {
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
      
      const configState = useConfigStore.getState();
      const { syncImages } = configState.cloudSync;
      
      const conversations = await db.conversations.toArray();
      let messages = await db.messages.toArray();
      const images = syncImages ? await db.images.toArray() : [];
      const deletedRecords = await db.deleted_records.toArray();

      const estimatedSize = JSON.stringify({ conversations, messages, images, deletedRecords }).length;
      const MAX_SYNC_SIZE = 50 * 1024 * 1024;
      
      if (estimatedSize > MAX_SYNC_SIZE) {
        const errorMsg = `Sync data too large (${(estimatedSize / 1024 / 1024).toFixed(2)}MB). Maximum allowed is 50MB. Please clear some history or disable image sync.`;
        logger.error('SyncService', errorMsg);
        useConfigStore.getState().updateCloudSync({ 
          syncStatus: 'error', 
          lastError: errorMsg 
        });
        this.isSyncing = false;
        return;
      }
      
      if (!syncImages) {
        messages = messages.map(msg => ({
          ...msg,
          content: Array.isArray(msg.content) 
            ? msg.content.map(part => part.type === 'image_url' ? { ...part, image_url: { ...part.image_url, url: '' }, _sync_placeholder: true } : part)
            : msg.content
        }));
      }
      
      let knowledgeBases = [];
      try {
        const kbModule = await import('../store/useKnowledgeBaseStore');
        knowledgeBases = kbModule.useKnowledgeBaseStore.getState().knowledgeBases || [];
      } catch (e) {
        logger.warn('SyncService', 'Failed to collect knowledge bases for sync', e);
      }
      
      const payload = {
        config: {
            providers: configState.providers,
            defaultModels: configState.defaultModels,
            general: configState.general,
            proxy: configState.proxy, 
            searchSettings: configState.searchSettings,
            conversationPresets: configState.conversationPresets,
            conversationSettings: configState.conversationSettings,
            retrievalSettings: configState.retrievalSettings
        },
        conversations,
        messages,
        images,
        knowledgeBases,
        deletedRecords,
        timestamp: Date.now()
      };

      const encryptedData = await encryptData(payload, sessionPassword);
      
      const apiBaseUrl = this._getApiBaseUrl();
      
      await axios.post(`${apiBaseUrl}/api/sync`, {
        id: syncId,
        data: encryptedData,
        timestamp: payload.timestamp
      }, {
        timeout: this.cloudSyncConfig.timeout
      });

      useConfigStore.getState().updateCloudSync({ 
        lastSyncTime: Date.now(),
        syncStatus: 'success'
      });
      logger.debug('SyncService', 'Sync to cloud completed');

    } catch (error) {
      const errorMessage = this._extractErrorMessage(error);
      
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        logger.warn('SyncService', 'Cloud sync server unavailable, will retry later');
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
        timeout: this.cloudSyncConfig.timeout
      });
      const { data: encryptedData, timestamp } = response.data;

      if (!encryptedData) return;

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
            // 静默处理
        } else {
            logger.error('SyncService', 'Sync from cloud failed', { error, message: errorMessage });
            useConfigStore.getState().updateCloudSync({ 
              syncStatus: 'error', 
              lastError: errorMessage 
            });
        }
    }
  }

  /**
   * 将云端数据应用到本地
   * @param {object} cloudData - 解密后的云端数据
   */
  async applyCloudData(cloudData) {
    if (!cloudData) return;

    const { syncImages } = useConfigStore.getState().cloudSync;

    if (cloudData.config) {
       useConfigStore.setState(state => ({
           ...state,
           ...cloudData.config,
           cloudSync: state.cloudSync 
       }));

       if (cloudData.config.retrievalSettings) {
           try {
               const kbModule = await import('../store/useKnowledgeBaseStore');
               kbModule.useKnowledgeBaseStore.setState({
                   retrievalSettings: cloudData.config.retrievalSettings
               });
           } catch (e) {
               logger.warn('SyncService', 'Failed to apply retrieval settings', e);
           }
       }
    }

    if (cloudData.deletedRecords && cloudData.deletedRecords.length > 0) {
      await db.transaction('rw', [db.conversations, db.messages, db.images, db.deleted_records], async () => {
        for (const record of cloudData.deletedRecords) {
          const { tableName, recordId, deletedAt } = record;
          if (db[tableName]) {
            const local = await db[tableName].get(recordId);
            if (local) {
              const localUpdatedAt = local.lastUpdatedAt || local.timestamp || local.updatedAt || 0;
              if (localUpdatedAt < deletedAt) {
                await db[tableName].delete(recordId);
                logger.debug('SyncService', `Applied cloud deletion for ${tableName}:${recordId}`);
              }
            }
          }
          await db.deleted_records.put(record);
        }
      });
    }

    const localTombstones = await db.deleted_records.toArray();
    const tombstoneMap = new Map(localTombstones.map(t => [`${t.tableName}:${t.recordId}`, t.deletedAt]));

    const shouldSkipByTombstone = (tableName, item) => {
      const key = `${tableName}:${item.id}`;
      const deletedAt = tombstoneMap.get(key);
      if (deletedAt) {
        const itemUpdatedAt = item.lastUpdatedAt || item.timestamp || item.updatedAt || 0;
        if (itemUpdatedAt < deletedAt) {
          return true;
        }
      }
      return false;
    };

    await db.transaction('rw', [db.conversations, db.messages, db.images], async () => {
        if (cloudData.conversations && cloudData.conversations.length > 0) {
            let conversationsToApply = cloudData.conversations.filter(c => !shouldSkipByTombstone('conversations', c));
            
            conversationsToApply = conversationsToApply.map(c => ({
              ...c,
              lastUpdatedAt: typeof c.lastUpdatedAt === 'number' ? c.lastUpdatedAt : Date.now(),
              title: String(c.title || 'Untitled')
            }));

            if (conversationsToApply.length > 0) {
              await db.conversations.bulkPut(conversationsToApply);
            }
        }
        if (cloudData.messages && cloudData.messages.length > 0) {
            let messagesToApply = cloudData.messages.filter(m => !shouldSkipByTombstone('messages', m));
            
            messagesToApply = messagesToApply.map(msg => {
                const cleaned = {
                  ...msg,
                  timestamp: typeof msg.timestamp === 'number' ? msg.timestamp : (msg.timestamp ? new Date(msg.timestamp).getTime() : Date.now()),
                  role: msg.role || 'user',
                  content: msg.content === undefined || msg.content === null ? '' : msg.content
                };
                if (!cleaned.parentId) cleaned.parentId = null;
                return cleaned;
            });

            if (!syncImages) {
                messagesToApply = messagesToApply.map(msg => {
                    return {
                        ...msg,
                        content: Array.isArray(msg.content)
                            ? msg.content.map(part => part.type === 'image_url' ? { ...part, image_url: { ...part.image_url, url: '' }, _sync_placeholder: true } : part)
                            : msg.content
                    };
                });
            } else {
                const ids = messagesToApply.map(m => m.id).filter(id => id !== undefined && id !== null);
                const localMessages = await db.messages.where('id').anyOf(ids).toArray();
                const localMsgMap = new Map(localMessages.map(m => [m.id, m]));
                
                messagesToApply = messagesToApply.map(msg => {
                    const localMsg = localMsgMap.get(msg.id);
                    if (localMsg && Array.isArray(localMsg.content) && Array.isArray(msg.content)) {
                        const newContent = msg.content.map((part, idx) => {
                            const localPart = localMsg.content[idx];
                            if (part.type === 'image_url' && (!part.image_url?.url || part._sync_placeholder) && localPart?.type === 'image_url' && localPart.image_url?.url) {
                                return localPart;
                            }
                            return part;
                        });
                        return { ...msg, content: newContent };
                    }
                    return msg;
                });
            }
            
            if (messagesToApply.length > 0) {
              await db.messages.bulkPut(messagesToApply);
            }
        }
        if (cloudData.images && cloudData.images.length > 0 && syncImages) {
            const imagesToApply = cloudData.images.filter(img => !shouldSkipByTombstone('images', img));
            if (imagesToApply.length > 0) {
              await db.images.bulkPut(imagesToApply);
            }
        }
    });

    if (cloudData.knowledgeBases && cloudData.knowledgeBases.length > 0) {
        try {
            const kbModule = await import('../store/useKnowledgeBaseStore');
            const { knowledgeBases: localKBs } = kbModule.useKnowledgeBaseStore.getState();
            
            const kbMap = new Map(localKBs.map(kb => [kb.id, kb]));
            cloudData.knowledgeBases.forEach(kb => {
                if (!shouldSkipByTombstone('knowledgeBases', kb)) {
                  kbMap.set(kb.id, kb);
                }
            });
            
            kbModule.useKnowledgeBaseStore.setState({
                knowledgeBases: Array.from(kbMap.values())
            });
        } catch (e) {
            logger.error('SyncService', 'Failed to apply knowledge bases from cloud', e);
        }
    }
    
    useConfigStore.getState().updateCloudSync({ 
      lastSyncTime: Date.now(),
      syncStatus: 'success'
    });
    
    useConfigStore.getState().applyTheme();
    
    logger.info('SyncService', 'Cloud data applied successfully');
  }

  /**
   * 删除云端所有同步数据
   */
  async deleteCloudData() {
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
   * @param {boolean} force - 是否强制刷新
   * @returns {Promise<boolean>} 是否可用
   */
  async checkProxyHealth(force = false) {
    const { proxy } = useConfigStore.getState();
    if (!proxy?.enabled) {
      this.proxyStatus = {
        ...this.proxyStatus,
        isAvailable: false,
        lastCheckTime: Date.now()
      };
      return false;
    }

    if (!force && Date.now() - this.proxyStatus.lastCheckTime < 5000 && this.proxyStatus.lastCheckTime !== 0) {
      return this.proxyStatus.isAvailable;
    }

    const apiBaseUrl = this._getApiBaseUrl();
    const healthCheckUrl = `${apiBaseUrl}/api/health`;
    
    try {
      const response = await axios.get(healthCheckUrl, { 
        timeout: this.cloudSyncConfig.timeout,
        validateStatus: (status) => status >= 200 && status < 300
      });
      
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
        
        if (!wasAvailable) {
           logger.info('SyncService', `Sync server is now online: ${healthCheckUrl}`);
        }
        return true;
      }
      
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
      
      if (wasAvailable) {
        logger.warn('SyncService', `Sync server went offline: ${error.message}`);
      }
      return false;
    }
  }

  /**
   * 启动代理健康监控轮询
   */
  startProxyHealthMonitoring() {
    if (this.proxyHealthCheckInterval) return;
    
    this.proxyHealthCheckInterval = setInterval(async () => {
      const { cloudSync } = useConfigStore.getState();
      if (!cloudSync?.enabled) {
        this.stopProxyHealthMonitoring();
        return;
      }
      
      await this.checkProxyHealth();
    }, SYNC_CONFIG.HEALTH_CHECK_INTERVAL);
    
    logger.info('SyncService', 'Proxy health monitoring started');
  }

  /**
   * 停止代理健康监控
   */
  stopProxyHealthMonitoring() {
    if (this.proxyHealthCheckInterval) {
      clearInterval(this.proxyHealthCheckInterval);
      this.proxyHealthCheckInterval = null;
      logger.info('SyncService', 'Proxy health monitoring stopped');
    }
  }

  /**
   * 启动云端定时轮询
   */
  startCloudPolling() {
    if (this.pollingInterval) return;
    
    this.pollingInterval = setInterval(async () => {
      const { cloudSync } = useConfigStore.getState();
      if (!cloudSync?.enabled || !cloudSync?.autoSync) {
        this.stopCloudPolling();
        return;
      }

      if (this.isSyncing) return;

      try {
        await this.syncFromCloud();
      } catch (e) {
        // 静默处理
      }
    }, SYNC_CONFIG.POLLING_INTERVAL);
    
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

  /**
   * 获取代理状态
   * @returns {object} 代理状态对象
   */
  getProxyStatus() {
    return { ...this.proxyStatus };
  }

  /**
   * 生成离线加密备份文件
   * @param {string} password - 加密密码
   * @param {object} options - 导出选项
   * @returns {Promise<Blob>} 备份文件 Blob
   */
  async exportFullBackup(password, options = {}) {
    const {
      includeSystemLogs = false,
      includePublished = true
    } = options;

    try {
      logger.info('SyncService', 'Starting full backup export');
      
      const allData = await collectAllSyncData({ 
        includeSystemLogs, 
        includePublished 
      });
      
      const appVersion = '1.0.0';
      
      const backupPackage = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        appVersion: appVersion,
        data: allData
      };
      
      const encrypted = await encryptData(backupPackage, password);
      
      const checksum = await calculateChecksum(encrypted);
      
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
   * @param {File} file - 备份文件
   * @param {string} password - 密码
   * @returns {Promise<object>} 恢复结果统计
   */
  async importFullBackup(file, password) {
    try {
      logger.info('SyncService', 'Starting backup import');
      
      const fileContent = await this._readFile(file);
      const backupData = JSON.parse(fileContent);
      
      const calculatedChecksum = await calculateChecksum(backupData.payload);
      if (calculatedChecksum !== backupData.checksum) {
        const { t } = useI18nStore.getState();
        throw new Error(t('services.sync.checksumFailed'));
      }
      
      logger.info('SyncService', 'Checksum validated successfully');
      
      const backupPackage = await decryptData(backupData.payload, password);
      
      if (!isVersionCompatible(backupPackage.version)) {
        const { t } = useI18nStore.getState();
        throw new Error(t('services.sync.versionIncompatible', { version: backupPackage.version }));
      }
      
      logger.info('SyncService', 'Version compatibility check passed');
      
      const validation = validateRestoredData(backupPackage.data);
      if (!validation.valid) {
        const { t } = useI18nStore.getState();
        throw new Error(t('services.sync.validationFailed', { errors: validation.errors.join(', ') }));
      }
      
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
   * 读取文件内容为文本
   * @private
   * @param {File} file - 待读取文件
   * @returns {Promise<string>} 文件内容
   */
  _readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  }

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
   * @private
   * @param {Error} error - 错误对象
   * @returns {string} 错误描述
   */
  _extractErrorMessage(error) {
    if (!error) return 'Unknown error';
    
    if (error.response && error.response.data) {
      const data = error.response.data;
      if (typeof data === 'object') {
        return data.message || data.error || JSON.stringify(data);
      }
      return String(data);
    }
    
    if (error.request) {
      return 'No response from server. Please check your network connection.';
    }
    
    return error.message || String(error);
  }

  /**
   * 获取 API 基础 URL
   * @private
   * @returns {string} 基础 URL
   */
  _getApiBaseUrl() {
    const { cloudSync } = useConfigStore.getState();
    let url = cloudSync?.apiUrl;
    
    if (url && url.trim()) {
      return url.trim().replace(/\/+$/, '');
    }
    
    return '';
  }

  /**
   * 带重试机制的 HTTP 请求 (保留用于未来增量同步)
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

        await new Promise(resolve => 
          setTimeout(resolve, this.cloudSyncConfig.retryDelay * (i + 1))
        );
        logger.warn('SyncService', `Request failed, retrying (${i + 1}/${retries})...`);
      }
    }
  }

  /**
   * 智能同步：带有冲突检测与合并策略
   * @param {string} password - 同步密码
   * @param {string} strategy - 冲突解决策略
   * @returns {Promise<object>} 同步结果
   */
  async syncWithConflictResolution(password, strategy = ResolutionStrategy.TIMESTAMP) {
    try {
      logger.info('SyncService', 'Starting sync with conflict resolution');
      
      const syncId = await this.getSyncId(password);
      if (!syncId) throw new Error('Failed to generate sync ID');

      useConfigStore.getState().updateCloudSync({
        syncStatus: 'syncing',
        lastError: null
      });

      const apiBaseUrl = this._getApiBaseUrl();

      let cloudPayload = null;
      try {
        const response = await axios.get(`${apiBaseUrl}/api/sync/${syncId}`, {
          timeout: this.cloudSyncConfig.timeout
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
          throw error;
        }
      }

      if (cloudPayload) {
        if (cloudPayload.deletedRecords && cloudPayload.deletedRecords.length > 0) {
          await db.transaction('rw', [db.conversations, db.messages, db.images, db.deleted_records], async () => {
            for (const record of cloudPayload.deletedRecords) {
              const { tableName, recordId, deletedAt } = record;
              if (db[tableName]) {
                const local = await db[tableName].get(recordId);
                if (local) {
                  const localUpdatedAt = local.lastUpdatedAt || local.timestamp || local.updatedAt || 0;
                  if (localUpdatedAt < deletedAt) {
                    await db[tableName].delete(recordId);
                  }
                }
              }
              await db.deleted_records.put(record);
            }
          });
        }

        const localConversations = await db.conversations.toArray();
        const localMessages = await db.messages.toArray();

        const localTombstones = await db.deleted_records.toArray();
        const tombstoneMap = new Map(localTombstones.map(t => [`${t.tableName}:${t.recordId}`, t.deletedAt]));

        const shouldSkipByTombstone = (tableName, item) => {
          const key = `${tableName}:${item.id}`;
          const deletedAt = tombstoneMap.get(key);
          if (deletedAt) {
            const itemUpdatedAt = item.lastUpdatedAt || item.timestamp || item.updatedAt || 0;
            if (itemUpdatedAt < deletedAt) {
              return true;
            }
          }
          return false;
        };

        const convConflicts = detectConflicts(localConversations, cloudPayload.conversations || []);
        const msgConflicts = detectConflicts(localMessages, cloudPayload.messages || []);
        
        const totalConflicts = convConflicts.length + msgConflicts.length;
        logger.debug('SyncService', `Detected ${totalConflicts} conflicts during merge`);

        const conflictConvIds = new Set(convConflicts.map(c => c.local.id));
        const conflictMsgIds = new Set(msgConflicts.map(c => c.local.id));

        if (totalConflicts > 0) {
          const resolvedConversations = resolveConflicts(convConflicts, strategy);
          const resolvedMessages = resolveConflicts(msgConflicts, strategy);

          await db.transaction('rw', [db.conversations, db.messages], async () => {
            for (const resolved of resolvedConversations) {
              await db.conversations.put(resolved.data);
            }
            for (const resolved of resolvedMessages) {
              await db.messages.put(resolved.data);
            }
          });
          logger.info('SyncService', `Resolved and applied ${totalConflicts} conflicts using ${strategy}`);
        }

        const { syncImages } = useConfigStore.getState().cloudSync;
        await db.transaction('rw', [db.conversations, db.messages, db.images], async () => {
          if (cloudPayload.conversations) {
            const conversationsToApply = cloudPayload.conversations.filter(c => 
              !conflictConvIds.has(c.id) && !shouldSkipByTombstone('conversations', c)
            );
            if (conversationsToApply.length > 0) {
              await db.conversations.bulkPut(conversationsToApply);
            }
          }
          if (cloudPayload.messages) {
            let messagesToApply = cloudPayload.messages.filter(m => 
              !conflictMsgIds.has(m.id) && !shouldSkipByTombstone('messages', m)
            );
            
            if (messagesToApply.length > 0) {
              if (!syncImages) {
                messagesToApply = messagesToApply.map(msg => ({
                  ...msg,
                  content: Array.isArray(msg.content) 
                    ? msg.content.map(part => part.type === 'image_url' ? { ...part, image_url: { ...part.image_url, url: '' }, _sync_placeholder: true } : part)
                    : msg.content
                }));
              } else {
                const localMessages = await db.messages.where('id').anyOf(messagesToApply.map(m => m.id)).toArray();
                const localMsgMap = new Map(localMessages.map(m => [m.id, m]));
                messagesToApply = messagesToApply.map(msg => {
                  const localMsg = localMsgMap.get(msg.id);
                  if (localMsg && Array.isArray(localMsg.content) && Array.isArray(msg.content)) {
                      const newContent = msg.content.map((part, idx) => {
                          const localPart = localMsg.content[idx];
                          if (part.type === 'image_url' && (!part.image_url?.url || part._sync_placeholder) && localPart?.type === 'image_url' && localPart.image_url?.url) {
                              return localPart;
                          }
                          return part;
                      });
                      return { ...msg, content: newContent };
                  }
                  return msg;
                });
              }
              await db.messages.bulkPut(messagesToApply);
            }
          }
          if (cloudPayload.images && syncImages) {
            const imagesToApply = cloudPayload.images.filter(img => !shouldSkipByTombstone('images', img));
            if (imagesToApply.length > 0) {
              await db.images.bulkPut(imagesToApply);
            }
          }
        });

        if (cloudPayload.knowledgeBases && cloudPayload.knowledgeBases.length > 0) {
            try {
                const kbModule = await import('../store/useKnowledgeBaseStore');
                const { knowledgeBases: currentKBs } = kbModule.useKnowledgeBaseStore.getState();
                const kbMap = new Map(currentKBs.map(kb => [kb.id, kb]));
                cloudPayload.knowledgeBases.forEach(kb => {
                    if (!shouldSkipByTombstone('knowledgeBases', kb)) {
                      kbMap.set(kb.id, kb);
                    }
                });
                kbModule.useKnowledgeBaseStore.setState({
                    knowledgeBases: Array.from(kbMap.values())
                });
            } catch (e) {
                logger.error('SyncService', 'Merge knowledge bases failed', e);
            }
        }

        if (cloudPayload.config) {
          useConfigStore.setState(state => ({
            ...state,
            ...cloudPayload.config,
            cloudSync: state.cloudSync 
          }));

          if (cloudPayload.config.retrievalSettings) {
            try {
                const kbModule = await import('../store/useKnowledgeBaseStore');
                kbModule.useKnowledgeBaseStore.setState({
                    retrievalSettings: cloudPayload.config.retrievalSettings
                });
            } catch (e) {
                logger.warn('SyncService', 'Failed to merge retrieval settings', e);
            }
          }
        }
      }

      this.hasSyncedOnce = true;

      await this.syncToCloud(true);

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
      
      useConfigStore.getState().updateCloudSync({
        syncStatus: 'error',
        lastError: errorMessage
      });

      throw new Error(errorMessage);
    }
  }
}

export const syncService = new SyncService();