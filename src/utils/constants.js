/**
 * 应用全局常量定义
 */

export const APP_INIT_TIMEOUT = 15000;

/**
 * 同步服务配置
 */
export const SYNC_CONFIG = {
  RETRY_COUNT: 3,
  RETRY_DELAY: 1000,
  TIMEOUT: 30000,
  POLLING_INTERVAL: 1000 * 60 * 5,
  HEALTH_CHECK_INTERVAL: 30000,
  DEBOUNCE_WAIT: 5000
};

/**
 * 数据库表名常量
 */
export const DB_TABLES = {
  CONVERSATIONS: 'conversations',
  MESSAGES: 'messages',
  IMAGES: 'images',
  KNOWLEDGE_BASES: 'knowledgeBases'
};

/**
 * 聊天交互配置
 */
export const CHAT_CONFIG = {
  IMAGE_MAX_SIZE: 1920,
  IMAGE_QUALITY: 0.8,
  AUTO_RENAME_DELAY: 2000,
  CONTEXT_POLLING_INTERVAL: 2000,
  SYNC_FEEDBACK_DURATION: 3000,
  SYNC_ERROR_DURATION: 5000
};