/**
 * AI 请求缓存管理器
 * 用于缓存非流式 AI 请求结果，减少冗余的网络开销。
 */

import { logger } from '../services/logger';

class RequestCacheManager {
  constructor() {
    this.cache = new Map();
    this.maxCacheSize = 100;
    this.maxCacheAge = 60 * 60 * 1000;
    
    if (typeof setInterval !== 'undefined') {
      setInterval(() => this.cleanExpiredCache(), 10 * 60 * 1000);
    }
  }

  /**
   * 生成缓存标识键
   * @param {object} requestData - 请求参数对象
   * @returns {string} 缓存键
   */
  generateCacheKey(requestData) {
    const { url, method = 'POST', data } = requestData;
    
    if (method.toUpperCase() === 'GET') {
      return `GET:${url}`;
    }
    
    if (data) {
      const dataStr = JSON.stringify(data);
      const hash = this._simpleHash(dataStr);
      return `${method}:${url}:${hash}`;
    }
    
    return `${method}:${url}`;
  }

  /**
   * 简单的字符串哈希计算
   * @param {string} str - 待哈希字符串
   * @returns {string} 哈希结果
   */
  _simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  /**
   * 检查请求是否符合缓存条件
   * @param {object} requestData - 请求参数对象
   * @returns {boolean} 是否应缓存
   */
  shouldCache(requestData) {
    const { url, data } = requestData;
    
    if (data?.stream) {
      return false;
    }
    
    if (url.includes('/chat/completions') || url.includes('/messages')) {
      return false;
    }
    
    if (url.includes('/models')) {
      return true;
    }
    
    if (url.includes('/images/generations') && data?.seed && data.seed !== -1) {
      return true;
    }
    
    return false;
  }

  /**
   * 获取缓存项
   * @param {string} cacheKey - 缓存键
   * @returns {any|null} 缓存数据
   */
  get(cacheKey) {
    const cached = this.cache.get(cacheKey);
    
    if (!cached) {
      return null;
    }
    
    if (Date.now() - cached.timestamp > this.maxCacheAge) {
      this.cache.delete(cacheKey);
      logger.debug('RequestCache', 'Cache expired:', cacheKey);
      return null;
    }
    
    logger.info('RequestCache', 'Cache hit:', cacheKey);
    return cached.data;
  }

  /**
   * 写入缓存项
   * @param {string} cacheKey - 缓存键
   * @param {any} data - 待缓存数据
   */
  set(cacheKey, data) {
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
      logger.debug('RequestCache', 'Cache full, removed oldest entry');
    }
    
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    
    logger.debug('RequestCache', 'Cached:', cacheKey);
  }

  /**
   * 清理已过期的缓存条目
   */
  cleanExpiredCache() {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.maxCacheAge) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      logger.info('RequestCache', `Cleaned ${cleanedCount} expired cache entries`);
    }
  }

  /**
   * 清空全部缓存
   */
  clear() {
    this.cache.clear();
    logger.info('RequestCache', 'Cache cleared');
  }

  /**
   * 获取当前缓存统计
   * @returns {object} 统计信息
   */
  getStats() {
    const now = Date.now();
    let validCount = 0;
    let expiredCount = 0;
    
    for (const [, value] of this.cache.entries()) {
      if (now - value.timestamp > this.maxCacheAge) {
        expiredCount++;
      } else {
        validCount++;
      }
    }
    
    return {
      total: this.cache.size,
      valid: validCount,
      expired: expiredCount,
      maxSize: this.maxCacheSize,
      maxAge: this.maxCacheAge
    };
  }
}

export const requestCache = new RequestCacheManager();

/**
 * 包装异步函数以支持缓存
 * @param {object} requestData - 请求标识参数
 * @param {Function} executeFn - 实际执行请求的函数
 * @returns {Promise<any>} 请求结果
 */
export async function withCache(requestData, executeFn) {
  if (!requestCache.shouldCache(requestData)) {
    return await executeFn();
  }
  
  const cacheKey = requestCache.generateCacheKey(requestData);
  
  const cached = requestCache.get(cacheKey);
  if (cached) {
    return cached;
  }
  
  try {
    const result = await executeFn();
    requestCache.set(cacheKey, result);
    return result;
  } catch (error) {
    throw error;
  }
}