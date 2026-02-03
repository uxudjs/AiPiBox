/**
 * 运行时环境探测工具
 * 自动识别部署平台并动态调整 API 端点路由
 */

import { logger } from '../services/logger';

/**
 * 支持的部署平台类型
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
 * 执行环境嗅探
 */
export function detectPlatform() {
  if (typeof window === 'undefined') {
    return Platform.UNKNOWN;
  }

  const hostname = window.location.hostname;

  // 1. 本地开发
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.')) {
    return Platform.LOCAL;
  }

  // 2. GitHub Pages (特指 *.github.io)
  if (hostname.endsWith('.github.io')) {
    return Platform.GITHUB_PAGES;
  }

  // 3. Cloudflare Pages
  if (hostname.endsWith('.pages.dev') || window.__CF_PAGES__) {
    return Platform.CLOUDFLARE;
  }

  // 4. Vercel
  if (hostname.endsWith('.vercel.app') || hostname.endsWith('.vercel.sh')) {
    return Platform.VERCEL;
  }

  // 5. Netlify
  if (hostname.endsWith('.netlify.app') || hostname.endsWith('.netlify.com')) {
    return Platform.NETLIFY;
  }

  // 6. 默认判定为通用生产环境（包括自定义域名）
  return Platform.UNKNOWN;
}

/**
 * 自动路由：获取 AI 代理端点地址
 * 采用相对路径策略，实现自动域名识别
 */
export function getProxyApiUrl(platform = null) {
  const detectedPlatform = platform || detectPlatform();

  // GitHub Pages 特殊处理：因为它是纯静态的，通常需要指向外部 API
  if (detectedPlatform === Platform.GITHUB_PAGES) {
    const externalProxy = window.EXTERNAL_PROXY_URL;
    if (externalProxy) return externalProxy;
    logger.warn('envDetect', 'GitHub Pages detected but no external proxy configured');
  }

  // 通用策略：使用相对路径
  // 1. 本地开发：通过 Vite Proxy 转发到 5000 端口
  // 2. 生产环境：无论是 Cloudflare/Vercel/Netlify 还是自定义域名，均统一使用 /api/ 路径
  return '/api/ai-proxy';
}

/**
 * 自动路由：获取云同步后端端点地址
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
 */
export function isProduction() {
  return detectPlatform() !== Platform.LOCAL;
}

/**
 * 获取平台特定配置
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

  // 针对已知平台的微调
  if (detectedPlatform === Platform.GITHUB_PAGES) {
    baseConfig.timeout = 60;
    baseConfig.features.serverlessFunctions = false;
    baseConfig.features.externalApiRequired = true;
  }

  return baseConfig;
}

/**
 * 环境感知初始化
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
 * 获取当前环境配置
 */
export function getEnvironmentConfig() {
  if (typeof window !== 'undefined' && window.__PLATFORM_CONFIG__) {
    return window.__PLATFORM_CONFIG__;
  }
  return initializeEnvironment();
}

/**
 * 检测是否为移动设备
 */
export function isMobileDevice() {
  if (typeof window === 'undefined') return false;
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  const mobileRegex = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini|harmonyos|harmony/i;
  const isIPadOS = (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  return mobileRegex.test(userAgent.toLowerCase()) || isIPadOS;
}
