/**
 * 应用全局常量
 */

// 初始化超时时间 (15秒)
export const APP_INIT_TIMEOUT = 15000;

// 同步服务配置
export const SYNC_CONFIG = {
  RETRY_COUNT: 3,
  RETRY_DELAY: 1000,
  TIMEOUT: 30000,
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

// 聊天交互配置
export const CHAT_CONFIG = {
  IMAGE_MAX_SIZE: 1920,
  IMAGE_QUALITY: 0.8,
  AUTO_RENAME_DELAY: 2000,
  CONTEXT_POLLING_INTERVAL: 2000, // 增加到 2 秒或根据需要调整，后面我们会尝试完全移除轮询
  SYNC_FEEDBACK_DURATION: 3000,
  SYNC_ERROR_DURATION: 5000
};
