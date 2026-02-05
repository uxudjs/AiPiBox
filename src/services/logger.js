import { db } from '../db';

// 日志数量限制
const LOG_LIMIT = 500;
// 触发日志轮转的阈值
const ROTATION_THRESHOLD = 500;

/**
 * 全局日志持久化服务
 * 负责将系统运行时日志写入 IndexedDB，并自动执行日志轮转以控制存储占用
 */
class LoggerService {
  constructor() {
    this.queue = [];         // 待处理日志缓冲区
    this.processing = false; // 是否正在执行写入任务
  }

  /**
   * 文本净化：移除 Emoji 符号
   */
  stripEmojis(text) {
    if (typeof text !== 'string') return text;
    return text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F018}-\u{1F0F5}\u{1F200}-\u{1F270}]/gu, '');
  }

  /**
   * 将日志 Payload 格式化为可读字符串
   */
  formatContent(content) {
    if (content instanceof Error) {
      return `${content.name}: ${content.message}\n${content.stack}`;
    }
    if (typeof content === 'object') {
      try {
        return JSON.stringify(content, null, 2);
      } catch (e) {
        return String(content);
      }
    }
    return String(content);
  }

  /**
   * 队列消费者
   * 实现批量写入优化及过期日志回收（Rotation）
   */
  async _processQueue() {
    if (this.processing || this.queue.length === 0) return;
    this.processing = true;

    try {
      // 批量写入日志（每次最多10条）
      while (this.queue.length > 0) {
        const batch = this.queue.splice(0, 10);
        await db.system_logs.bulkAdd(batch);
      }

      // 检查是否需要日志轮转
      const count = await db.system_logs.count();
      if (count > ROTATION_THRESHOLD) {
        // 删除最旧的日志，保持总数在限制内
        const deleteCount = count - LOG_LIMIT;
        const keys = await db.system_logs.orderBy('timestamp').limit(deleteCount).primaryKeys();
        await db.system_logs.bulkDelete(keys);
      }
    } catch (error) {
      // 日志系统失败不应影响应用运行
      // eslint-disable-next-line no-console
      console.error('Logging failed:', error);
    } finally {
      this.processing = false;
      if (this.queue.length > 0) {
        this._processQueue();
      }
    }
  }

  /**
   * 标准化日志入口
   * 包含脱敏逻辑（API Key 过滤）与 Emoji 清理
   */
  log(level, module, ...args) {
    // 屏蔽 INFO 与 DEBUG 日志以减轻性能负担
    if (level === 'info' || level === 'debug') return;

    const timestamp = new Date().toISOString();
    const cleanArgs = args.map(arg => this.formatContent(arg));
    const content = this.stripEmojis(cleanArgs.join(' '));

    // 二次过滤，确保没有敏感密钥泄露（防止formatContent中的对象序列化包含敏感字段）
    const sanitizedContent = content.replace(/(sk-proj-|sk-|key-|api_key=|Authorization:|Bearer\s)[a-zA-Z0-9_\-\.]{10,}/gi, '$1[REDACTED]');

    const logEntry = {
      level,
      module,
      content: sanitizedContent,
      timestamp
    };

    this.queue.push(logEntry);
    this._processQueue();
  }

  /**
   * 记录信息级别日志
   * 已禁用
   */
  info(module, ...args) {
    // 已禁用
  }

  /**
   * 记录警告级别日志
   * @param {string} module - 模块名称
   * @param {...any} args - 日志内容
   */
  warn(module, ...args) {
    this.log('warn', module, ...args);
  }

  /**
   * 记录错误级别日志
   * @param {string} module - 模块名称
   * @param {...any} args - 日志内容
   */
  error(module, ...args) {
    this.log('error', module, ...args);
  }

  /**
   * 记录调试级别日志
   * 已禁用
   */
  debug(module, ...args) {
    // 已禁用
  }
  
  /**
   * 清空所有日志
   */
  async clear() {
      await db.system_logs.clear();
  }

  /**
   * 诊断工具：导出日志 JSON
   */
  async export() {
      const logs = await db.system_logs.orderBy('timestamp').reverse().toArray();
      const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `system_logs_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  }
}

export const logger = new LoggerService();
