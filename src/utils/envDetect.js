/**
 * 运行时环境探测工具
 * 自动识别部署平台并动态调整 API 端点路由。
 */

import { logger } from '../services/logger';

/**
 * 部署平台枚举
 */
export const Platform = {
  VERCEL: 'vercel',
  NETLIFY: 'netlify',
  CLOUDFLARE: 'cloudflare',
  GITHUB_PAGES: 'github-pages',
  LOCAL: 'local',
  UNKNOWN: 'unknown'
};

/**
 * 识别当前部署平台
 * @returns {string} 平台标识符
 */
export function detectPlatform() {
  if (typeof window === 'undefined') {
    return Platform.UNKNOWN;
  }

  const hostname = window.location.hostname;

  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.')) {
    return Platform.LOCAL;
  }

  if (hostname.endsWith('.github.io')) {
    return Platform.GITHUB_PAGES;
  }

  if (hostname.endsWith('.pages.dev') || window.__CF_PAGES__) {
    return Platform.CLOUDFLARE;
  }

  if (hostname.endsWith('.vercel.app') || hostname.endsWith('.vercel.sh')) {
    return Platform.VERCEL;
  }

  if (hostname.endsWith('.netlify.app') || hostname.endsWith('.netlify.com')) {
    return Platform.NETLIFY;
  }

  return Platform.UNKNOWN;
}

/**
 * 获取 AI 代理端点地址
 * @param {string} [platform] - 平台标识
 * @returns {string} 代理接口路径
 */
export function getProxyApiUrl(platform = null) {
  const detectedPlatform = platform || detectPlatform();

  if (detectedPlatform === Platform.GITHUB_PAGES) {
    const externalProxy = window.EXTERNAL_PROXY_URL;
    if (externalProxy) return externalProxy;
    logger.warn('envDetect', 'GitHub Pages detected but no external proxy configured');
  }

  return '/api/ai-proxy';
}

/**
 * 获取云同步后端端点地址
 * @param {string} [platform] - 平台标识
 * @returns {string} 同步接口路径
 */
export function getSyncApiUrl(platform = null) {
  const detectedPlatform = platform || detectPlatform();

  if (detectedPlatform === Platform.GITHUB_PAGES) {
    const externalSync = window.EXTERNAL_SYNC_URL;
    if (externalSync) return externalSync;
  }

  return '/api/sync';
}

/**
 * 检测是否为生产环境
 * @returns {boolean} 是否为生产环境
 */
export function isProduction() {
  return detectPlatform() !== Platform.LOCAL;
}

/**
 * 获取平台特定配置报告
 * @param {string} [platform] - 平台标识
 * @returns {object} 配置对象
 */
export function getPlatformConfig(platform = null) {
  const detectedPlatform = platform || detectPlatform();

  const baseConfig = {
    platform: detectedPlatform,
    isProduction: detectedPlatform !== Platform.LOCAL,
    proxyUrl: getProxyApiUrl(detectedPlatform),
    syncUrl: getSyncApiUrl(detectedPlatform),
    timeout: 300,
    features: {
      serverlessFunctions: true,
      edgeRuntime: true,
      kv: true
    }
  };

  if (detectedPlatform === Platform.GITHUB_PAGES) {
    baseConfig.timeout = 60;
    baseConfig.features.serverlessFunctions = false;
    baseConfig.features.externalApiRequired = true;
  }

  return baseConfig;
}

/**
 * 环境感知初始化并缓存配置
 * @returns {object} 初始化的平台配置
 */
export function initializeEnvironment() {
  const config = getPlatformConfig();
  
  logger.info('envDetect', 'Environment initialized', {
    platform: config.platform,
    isProduction: config.isProduction,
    proxyUrl: config.proxyUrl,
    syncUrl: config.syncUrl
  });

  if (typeof window !== 'undefined') {
    window.__PLATFORM_CONFIG__ = config;
  }

  return config;
}

/**
 * 获取当前缓存的环境配置
 * @returns {object} 平台配置
 */
export function getEnvironmentConfig() {
  if (typeof window !== 'undefined' && window.__PLATFORM_CONFIG__) {
    return window.__PLATFORM_CONFIG__;
  }
  return initializeEnvironment();
}

/**
 * 检测是否为移动设备
 * @returns {boolean} 是否为移动端
 */
export function isMobileDevice() {
  if (typeof window === 'undefined') return false;
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  const mobileRegex = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini|harmonyos|harmony/i;
  const isIPadOS = (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  return mobileRegex.test(userAgent.toLowerCase()) || isIPadOS;
}