/**
 * 数据验证和备份工具模块
 * 提供数据完整性校验、版本兼容性检查、数据验证等功能
 */

import { logger } from '../services/logger';

/**
 * 计算数据的SHA-256校验和
 * @param {string|object} data - 要计算校验和的数据
 * @returns {Promise<string>} SHA-256哈希值(十六进制字符串)
 */
export async function calculateChecksum(data) {
  try {
    const encoder = new TextEncoder();
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    const dataBuffer = encoder.encode(dataString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  } catch (error) {
    logger.error('dataValidation', 'Failed to calculate checksum', error);
    throw new Error('校验和计算失败');
  }
}

/**
 * 验证恢复数据的完整性和格式
 * @param {object} data - 要验证的数据对象
 * @returns {object} 验证结果 { valid: boolean, errors: string[] }
 */
export function validateRestoredData(data) {
  const errors = [];
  
  // 验证必需的数据结构
  if (!data || typeof data !== 'object') {
    errors.push('数据格式无效');
    return { valid: false, errors };
  }
  
  // 验证配置数据
  if (!data.config || typeof data.config !== 'object') {
    errors.push('配置数据缺失或格式错误');
  } else {
    if (!Array.isArray(data.config.providers)) {
      errors.push('提供商配置格式错误');
    }
    if (!data.config.defaultModels || typeof data.config.defaultModels !== 'object') {
      errors.push('默认模型配置格式错误');
    }
  }
  
  // 验证对话数据
  if (data.conversations !== undefined && !Array.isArray(data.conversations)) {
    errors.push('对话数据格式错误');
  }
  
  // 验证消息数据
  if (data.messages !== undefined && !Array.isArray(data.messages)) {
    errors.push('消息数据格式错误');
  }
  
  // 验证图片数据
  if (data.images !== undefined && !Array.isArray(data.images)) {
    errors.push('图片历史数据格式错误');
  }
  
  // 验证已发布代码数据
  if (data.published !== undefined && !Array.isArray(data.published)) {
    errors.push('已发布代码数据格式错误');
  }
  
  // 验证知识库数据
  if (data.knowledgeBases !== undefined && !Array.isArray(data.knowledgeBases)) {
    errors.push('知识库数据格式错误');
  }
  
  // 验证系统日志数据
  if (data.systemLogs !== undefined && !Array.isArray(data.systemLogs)) {
    errors.push('系统日志数据格式错误');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 检查备份文件版本是否兼容
 * @param {string} backupVersion - 备份文件的版本号
 * @returns {boolean} 是否兼容
 */
export function isVersionCompatible(backupVersion) {
  if (!backupVersion) return false;
  
  // 支持的备份版本列表
  const supportedVersions = ['1.0.0'];
  
  return supportedVersions.includes(backupVersion);
}

/**
 * 收集所有需要备份的数据
 * @param {object} options - 收集选项
 * @param {boolean} options.includeSystemLogs - 是否包含系统日志
 * @param {boolean} options.includePublished - 是否包含已发布代码
 * @returns {Promise<object>} 收集到的所有数据
 */
export async function collectAllSyncData(options = {}) {
  const {
    includeSystemLogs = true,
    includePublished = true
  } = options;
  
  try {
    // 动态导入以避免循环依赖
    const { useConfigStore } = await import('../store/useConfigStore');
    const { useKnowledgeBaseStore } = await import('../store/useKnowledgeBaseStore');
    const { db } = await import('../db');
    
    const data = {
      config: {
        providers: useConfigStore.getState().providers,
        defaultModels: useConfigStore.getState().defaultModels,
        general: useConfigStore.getState().general,
        proxy: useConfigStore.getState().proxy,
        searchSettings: useConfigStore.getState().searchSettings,
        conversationPresets: useConfigStore.getState().conversationPresets,
        conversationSettings: useConfigStore.getState().conversationSettings,
        cloudSync: useConfigStore.getState().cloudSync
      },
      conversations: await db.conversations.toArray(),
      messages: await db.messages.toArray(),
      images: await db.images.toArray(),
      knowledgeBases: useKnowledgeBaseStore.getState().knowledgeBases || []
    };
    
    // 可选数据
    if (includePublished) {
      data.published = await db.published.toArray();
    }
    
    if (includeSystemLogs) {
      data.systemLogs = await db.system_logs.toArray();
    }
    
    logger.info('dataValidation', 'Data collected successfully', {
      conversations: data.conversations.length,
      messages: data.messages.length,
      images: data.images.length,
      knowledgeBases: data.knowledgeBases.length
    });
    
    return data;
  } catch (error) {
    logger.error('dataValidation', 'Failed to collect sync data', error);
    throw new Error('数据收集失败: ' + error.message);
  }
}

/**
 * 恢复所有数据到本地
 * @param {object} data - 要恢复的数据
 * @param {object} options - 恢复选项
 * @param {boolean} options.createBackup - 恢复前是否创建本地备份
 * @returns {Promise<void>}
 */
export async function restoreAllData(data, options = {}) {
  const { createBackup = true } = options;
  
  let localBackup = null;
  
  try {
    // 动态导入
    const { useConfigStore } = await import('../store/useConfigStore');
    const { useKnowledgeBaseStore } = await import('../store/useKnowledgeBaseStore');
    const { db } = await import('../db');
    
    // 验证数据
    const validation = validateRestoredData(data);
    if (!validation.valid) {
      throw new Error(`数据验证失败: ${validation.errors.join(', ')}`);
    }
    
    // 创建本地备份以支持回滚
    if (createBackup) {
      logger.info('dataValidation', 'Creating local backup before restore');
      localBackup = await collectAllSyncData();
    }
    
    // 使用事务恢复数据库数据
    await db.transaction('rw', 
      [db.conversations, db.messages, db.images, db.published, db.system_logs],
      async () => {
        // 清空现有数据
        await db.conversations.clear();
        await db.messages.clear();
        await db.images.clear();
        await db.published.clear();
        
        // 导入新数据
        if (data.conversations && data.conversations.length > 0) {
          await db.conversations.bulkAdd(data.conversations);
        }
        if (data.messages && data.messages.length > 0) {
          await db.messages.bulkAdd(data.messages);
        }
        if (data.images && data.images.length > 0) {
          await db.images.bulkAdd(data.images);
        }
        if (data.published && data.published.length > 0) {
          await db.published.bulkAdd(data.published);
        }
        if (data.systemLogs && data.systemLogs.length > 0) {
          await db.system_logs.clear();
          await db.system_logs.bulkAdd(data.systemLogs);
        }
      }
    );
    
    // 恢复Zustand状态
    if (data.config) {
      useConfigStore.setState(data.config);
      // 应用主题
      useConfigStore.getState().applyTheme();
    }
    
    if (data.knowledgeBases) {
      useKnowledgeBaseStore.setState({ 
        knowledgeBases: data.knowledgeBases 
      });
    }
    
    logger.info('dataValidation', 'Data restored successfully');
    
  } catch (error) {
    logger.error('dataValidation', 'Failed to restore data', error);
    
    // 尝试回滚
    if (localBackup && createBackup) {
      logger.warn('dataValidation', 'Attempting to rollback to local backup');
      try {
        await restoreAllData(localBackup, { createBackup: false });
        logger.info('dataValidation', 'Rollback successful');
      } catch (rollbackError) {
        logger.error('dataValidation', 'Rollback failed', rollbackError);
      }
    }
    
    throw new Error('数据恢复失败: ' + error.message);
  }
}

/**
 * 获取数据统计信息
 * @param {object} data - 数据对象
 * @returns {object} 统计信息
 */
export function getDataStatistics(data) {
  if (!data) return null;
  
  return {
    conversations: data.conversations?.length || 0,
    messages: data.messages?.length || 0,
    images: data.images?.length || 0,
    published: data.published?.length || 0,
    knowledgeBases: data.knowledgeBases?.length || 0,
    systemLogs: data.systemLogs?.length || 0,
    totalSize: calculateDataSize(data)
  };
}

/**
 * 估算数据大小(字节)
 * @param {object} data - 数据对象
 * @returns {number} 估算的数据大小
 */
function calculateDataSize(data) {
  try {
    const jsonString = JSON.stringify(data);
    return new Blob([jsonString]).size;
  } catch (error) {
    logger.error('dataValidation', 'Failed to calculate data size', error);
    return 0;
  }
}

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @returns {string} 格式化后的大小字符串
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
