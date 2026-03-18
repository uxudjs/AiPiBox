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
   * 构造请求认证头
   * 使用 syncId 自身作为签名密钥，对 syncId:timestamp 做 HMAC-SHA256 签名。
   * 只有持有正确密码（从而能够派生出正确 syncId）的客户端才能通过服务端校验。
   * @private
   * @param {string} syncId - 由密码派生的同步标识符
   * @returns {Promise<object>} 包含 X-Sync-Token 和 X-Timestamp 的请求头对象
   */
  async _buildAuthHeaders(syncId) {
    const timestamp = String(Date.now());
    const enc = new TextEncoder();

    const keyData = enc.encode(syncId);
    const msgData = enc.encode(`${syncId}:${timestamp}`);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', cryptoKey, msgData);
    const token = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0')).join('');

    return {
      'X-Sync-Token': token,
      'X-Timestamp':  timestamp
    };
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
      const authHeaders = await this._buildAuthHeaders(syncId);
      
      await axios.post(`${apiBaseUrl}/api/sync`, {
        id: syncId,
        data: encryptedData,
        timestamp: payload.timestamp
      }, {
        timeout: this.cloudSyncConfig.timeout,
        headers: authHeaders
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
      const authHeaders = await this._buildAuthHeaders(syncId);
      
      const response = await axios.get(`${apiBaseUrl}/api/sync/${syncId}`, {
        timeout: this.cloudSyncConfig.timeout,
        headers: authHeaders
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
              lastUpdatedAt: typeof
