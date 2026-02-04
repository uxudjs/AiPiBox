/**
 * 应用全局常量
 */

// 初始化超时时间 (15秒)
export const APP_INIT_TIMEOUT = 15000;

// 同步服务配置
export const SYNC_CONFIG = {
  RETRY_COUNT: 3,
  RETRY_DELAY: 1000,
  TIMEOUT: 10000,
  POLLING_INTERVAL: 1000 * 60 * 5, // 5 分钟
  HEALTH_CHECK_INTERVAL: 30000,    // 30 秒
  DEBOUNCE_WAIT: 5000              // 5 秒
};

// 数据库表名
export const DB_TABLES = {
  CONVERSATIONS: 'conversations',
  MESSAGES: 'messages',
  IMAGES: 'images',
  KNOWLEDGE_BASES: 'knowledgeBases'
};
