import Dexie from 'dexie';
try {
  // 注意：dexie-observable 会修改 Dexie 原型，必须在数据库实例创建前加载
  import('dexie-observable').catch(err => {
    console.warn('Failed to load dexie-observable, auto-sync might not work correctly', err);
  });
} catch (e) {
  console.warn('Dexie observable plugin loading error', e);
}
import { logger } from '../services/logger';

/**
 * 本地数据库模型 (IndexedDB)
 * 使用 Dexie.js 封装，提供对话历史、配置、图片及系统日志的持久化存储
 */
export const db = new Dexie('AiPiBoxDB');

// 数据库连接状态监控
db.on('blocked', () => {
  logger.warn('db', 'Database is blocked by another connection. Please close other tabs.');
});

db.on('versionchange', () => {
  logger.warn('db', 'Database version changed in another tab.');
  db.close();
  window.location.reload();
});

try {
// 历史版本定义（用于平滑迁移）
db.version(4).stores({
  conversations: '++id, title, lastUpdatedAt, isIncognito, isGenerating, hasUnread',
  messages: '++id, conversationId, role, content, timestamp, model',
  settings: 'key, value',
  backups: '++id, timestamp',
  published: 'id, content, language, timestamp',
  system_logs: '++id, level, module, content, timestamp'
});

/**
 * 版本 5：引入消息树结构
 * 添加 parentId 字段以支持对话分支（Branching）
 */
db.version(5).stores({
  conversations: '++id, title, lastUpdatedAt, isIncognito, isGenerating, hasUnread',
  messages: '++id, conversationId, role, content, timestamp, model, parentId',
  settings: 'key, value',
  backups: '++id, timestamp',
  published: 'id, content, language, timestamp',
  system_logs: '++id, level, module, content, timestamp'
}).upgrade(async trans => {
  // 将现有消息迁移为链表结构
  const conversations = await trans.table('conversations').toArray();
  
  for (const conv of conversations) {
    const messages = await trans.table('messages')
      .where('conversationId')
      .equals(conv.id)
      .sortBy('timestamp');
      
    if (messages.length === 0) continue;
    
    // 设置父指针和默认选中的子节点
    for (let i = 0; i < messages.length; i++) {
      const current = messages[i];
      const prev = i > 0 ? messages[i-1] : null;
      const next = i < messages.length - 1 ? messages[i+1] : null;
      
      const updates = {};
      
      // 链接到父节点
      if (prev) {
        updates.parentId = prev.id;
      } else {
        updates.parentId = null;
      }
      
      // 链接到子节点（保留线性历史）
      if (next) {
        updates.selectedChildId = next.id;
      }
      
      await trans.table('messages').update(current.id, updates);
    }
  }
});

/**
 * 版本 6：对话压缩
 * 为对话添加压缩摘要，为消息添加压缩标记
 */
db.version(6).stores({
  conversations: '++id, title, lastUpdatedAt, isIncognito, isGenerating, hasUnread, compressionData',
  messages: '++id, conversationId, role, content, timestamp, model, parentId, isCompressed',
  settings: 'key, value',
  backups: '++id, timestamp',
  published: 'id, content, language, timestamp',
  system_logs: '++id, level, module, content, timestamp'
}).upgrade(async trans => {
  // 为现有对话添加compressionData字段
  const conversations = await trans.table('conversations').toArray();
  for (const conv of conversations) {
    await trans.table('conversations').update(conv.id, {
      compressionData: null
    });
  }
  
  // 为现有消息添加isCompressed字段
  const messages = await trans.table('messages').toArray();
  for (const msg of messages) {
    await trans.table('messages').update(msg.id, {
      isCompressed: false
    });
  }
});

/**
 * 版本 7：图片生成支持
 * 引入图片工厂模型存储生成的图片元数据及 URL
 */
db.version(7).stores({
  conversations: '++id, title, lastUpdatedAt, isIncognito, isGenerating, hasUnread, compressionData',
  messages: '++id, conversationId, role, content, timestamp, model, parentId, isCompressed',
  images: '++id, providerId, modelId, prompt, negativePrompt, imageUrl, timestamp, width, height, seed, steps, cfgScale, mode',
  settings: 'key, value',
  backups: '++id, timestamp',
  published: 'id, content, language, timestamp',
  system_logs: '++id, level, module, content, timestamp'
});

/**
 * 版本 8：标题逻辑优化
 * 添加 manualTitle 标记以避免 AI 自动重命名覆盖用户手动设置的标题
 */
db.version(8).stores({
  conversations: '++id, title, lastUpdatedAt, isIncognito, isGenerating, hasUnread, compressionData, manualTitle',
  messages: '++id, conversationId, role, content, timestamp, model, parentId, isCompressed',
  images: '++id, providerId, modelId, prompt, negativePrompt, imageUrl, timestamp, width, height, seed, steps, cfgScale, mode',
  settings: 'key, value',
  backups: '++id, timestamp',
  published: 'id, content, language, timestamp',
  system_logs: '++id, level, module, content, timestamp'
}).upgrade(async trans => {
  const conversations = await trans.table('conversations').toArray();
  for (const conv of conversations) {
    if (conv.manualTitle === undefined) {
      await trans.table('conversations').update(conv.id, { manualTitle: false });
    }
  }
});

/**
 * 版本 9：索引优化
 * 移除消息内容的全文索引以减少磁盘占用并提升写入性能
 */
db.version(9).stores({
  conversations: '++id, title, lastUpdatedAt, isIncognito, isGenerating, hasUnread, compressionData, manualTitle',
  messages: '++id, conversationId, role, timestamp, model, parentId, isCompressed', // 移除了 content 索引
  images: '++id, providerId, modelId, prompt, negativePrompt, imageUrl, timestamp, width, height, seed, steps, cfgScale, mode',
  settings: 'key, value',
  backups: '++id, timestamp',
  published: 'id, content, language, timestamp',
  system_logs: '++id, level, module, content, timestamp'
});

/**
 * 版本 10：异步任务支持
 * 为消息添加 taskId 和 status 字段，支持断线重连和后台生成
 */
db.version(10).stores({
  conversations: '++id, title, lastUpdatedAt, isIncognito, isGenerating, hasUnread, compressionData, manualTitle',
  messages: '++id, conversationId, role, timestamp, model, parentId, isCompressed, taskId, status',
  images: '++id, providerId, modelId, prompt, negativePrompt, imageUrl, timestamp, width, height, seed, steps, cfgScale, mode',
  settings: 'key, value',
  backups: '++id, timestamp',
  published: 'id, content, language, timestamp',
  system_logs: '++id, level, module, content, timestamp'
}).upgrade(async trans => {
  const messages = await trans.table('messages').toArray();
  for (const msg of messages) {
    if (msg.status === undefined) {
      // 历史消息默认为已完成状态
      await trans.table('messages').update(msg.id, { 
        status: 'completed',
        taskId: null
      });
    }
  }
});

/**
 * 版本 11：同步墓碑支持
 * 新增 deleted_records 表，用于记录已删除对象的 ID 和时间戳
 */
db.version(11).stores({
  conversations: '++id, title, lastUpdatedAt, isIncognito, isGenerating, hasUnread, compressionData, manualTitle',
  messages: '++id, conversationId, role, timestamp, model, parentId, isCompressed, taskId, status',
  images: '++id, providerId, modelId, prompt, negativePrompt, imageUrl, timestamp, width, height, seed, steps, cfgScale, mode',
  deleted_records: '++id, [tableName+recordId], deletedAt',
  settings: 'key, value',
  backups: '++id, timestamp',
  published: 'id, content, language, timestamp',
  system_logs: '++id, level, module, content, timestamp'
});

} catch (error) {
  logger.error('db', 'Failed to initialize database schema', error);
  // 如果数据库初始化失败，尝试删除并重新创建
  if (error.name === 'VersionError' || error.name === 'DatabaseClosedError') {
    // 防止无限刷新循环：检查是否已经尝试过重新加载
    const hasReloaded = sessionStorage.getItem('db_reload_attempted');
    if (!hasReloaded) {
      sessionStorage.setItem('db_reload_attempted', 'true');
      logger.warn('db', 'Attempting to delete and recreate database...');
      Dexie.delete('AiPiBoxDB').then(() => {
        window.location.reload();
      }).catch(deleteError => {
        logger.error('db', 'Failed to delete database', deleteError);
        sessionStorage.removeItem('db_reload_attempted');
      });
    } else {
      logger.error('db', 'Database reload already attempted, manual intervention required');
      sessionStorage.removeItem('db_reload_attempted');
    }
  }
}

/**
 * 数据清空逻辑
 * 用于注销账户或重置应用状态
 */
export async function clearAllData() {
  await db.conversations.clear();
  await db.messages.clear();
  await db.settings.clear();
  await db.backups.clear();
  await db.system_logs.clear();
}

/**
 * 记录删除墓碑
 * @param {string} tableName 表名
 * @param {string|number} recordId 记录 ID
 */
export async function recordDeletion(tableName, recordId) {
  try {
    await db.deleted_records.put({
      tableName,
      recordId,
      deletedAt: Date.now()
    });
  } catch (e) {
    logger.error('db', `Failed to record deletion for ${tableName}:${recordId}`, e);
  }
}

/**
 * 批量记录删除墓碑
 * @param {string} tableName 表名
 * @param {Array<string|number>} recordIds 记录 ID 列表
 */
export async function recordBatchDeletion(tableName, recordIds) {
  if (!recordIds || recordIds.length === 0) return;
  try {
    const deletedAt = Date.now();
    const records = recordIds.map(id => ({
      tableName,
      recordId: id,
      deletedAt
    }));
    await db.deleted_records.bulkPut(records);
  } catch (e) {
    logger.error('db', `Failed to record batch deletion for ${tableName}`, e);
  }
}
