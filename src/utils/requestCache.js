/**
 * AI请求缓存管理器
 * 用于缓存AI请求结果,减少重复请求
 */

import { logger } from '../services/logger';

class RequestCacheManager {
  constructor() {
    this.cache = new Map();
    this.maxCacheSize = 100; // 最多缓存100个请求
    this.maxCacheAge = 60 * 60 * 1000; // 缓存有效期1小时
    
    // 定期清理过期缓存
    if (typeof setInterval !== 'undefined') {
      setInterval(() => this.cleanExpiredCache(), 10 * 60 * 1000); // 每10分钟清理一次
    }
  }

  /**
   * 生成缓存键
   */
  generateCacheKey(requestData) {
    const { url, method = 'POST', data } = requestData;
    
    // 对于GET请求,URL就是键
    if (method.toUpperCase() === 'GET') {
      return `GET:${url}`;
    }
    
    // 对于POST请求,需要包含data的hash
    if (data) {
      const dataStr = JSON.stringify(data);
      const hash = this._simpleHash(dataStr);
      return `${method}:${url}:${hash}`;
    }
    
    return `${method}:${url}`;
  }

  /**
   * 简单的字符串hash函数
   */
  _simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }

  /**
   * 检查是否应该缓存此请求
   */
  shouldCache(requestData) {
    const { url, data } = requestData;
    
    // 不缓存流式请求
    if (data?.stream) {
      return false;
    }
    
    // 不缓存聊天请求(因为可能包含上下文)
    if (url.includes('/chat/completions') || url.includes('/messages')) {
      return false;
    }
    
    // 缓存模型列表请求
    if (url.includes('/models')) {
      return true;
    }
    
    // 缓存图像生成请求(相同参数生成相同图像)
    if (url.includes('/images/generations') && data?.seed && data.seed !== -1) {
      return true;
    }
    
    return false;
  }

  /**
   * 获取缓存
   */
  get(cacheKey) {
    const cached = this.cache.get(cacheKey);
    
    if (!cached) {
      return null;
    }
    
    // 检查是否过期
    if (Date.now() - cached.timestamp > this.maxCacheAge) {
      this.cache.delete(cacheKey);
      logger.debug('RequestCache', 'Cache expired:', cacheKey);
      return null;
    }
    
    logger.info('RequestCache', 'Cache hit:', cacheKey);
    return cached.data;
  }

  /**
   * 设置缓存
   */
  set(cacheKey, data) {
    // 如果缓存已满,删除最旧的条目
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
   * 清理过期缓存
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
   * 清空所有缓存
   */
  clear() {
    this.cache.clear();
    logger.info('RequestCache', 'Cache cleared');
  }

  /**
   * 获取缓存统计信息
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

// 创建全局单例
export const requestCache = new RequestCacheManager();

/**
 * 使用缓存包装请求函数
 */
export async function withCache(requestData, executeFn) {
  // 检查是否应该缓存
  if (!requestCache.shouldCache(requestData)) {
    return await executeFn();
  }
  
  // 生成缓存键
  const cacheKey = requestCache.generateCacheKey(requestData);
  
  // 尝试从缓存获取
  const cached = requestCache.get(cacheKey);
  if (cached) {
    return cached;
  }
  
  // 执行请求
  try {
    const result = await executeFn();
    
    // 缓存结果
    requestCache.set(cacheKey, result);
    
    return result;
  } catch (error) {
    // 不缓存错误结果
    throw error;
  }
}
