/**
 * 运行时环境探测工具
 * 自动识别部署平台（Vercel, Netlify, Cloudflare 等）并动态调整 API 端点路由
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
  const userAgent = navigator.userAgent || '';

  // Vercel
  if (hostname.endsWith('.vercel.app') || hostname.endsWith('.vercel.sh')) {
    return Platform.VERCEL;
  }

  // Netlify
  if (hostname.endsWith('.netlify.app') || hostname.endsWith('.netlify.com')) {
    return Platform.NETLIFY;
  }

  // Cloudflare Pages
  if (hostname.endsWith('.pages.dev') || window.__CF_PAGES__) {
    return Platform.CLOUDFLARE;
  }

  // GitHub Pages
  if (hostname.endsWith('.github.io')) {
    return Platform.GITHUB_PAGES;
  }

  // 本地开发
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.')) {
    return Platform.LOCAL;
  }

  return Platform.UNKNOWN;
}

/**
 * 自动路由：获取 AI 代理端点地址
 */
export function getProxyApiUrl(platform = null) {
  const detectedPlatform = platform || detectPlatform();

  // 生产环境使用相对路径,自动使用当前域名
  if (detectedPlatform !== Platform.LOCAL) {
    switch (detectedPlatform) {
      case Platform.CLOUDFLARE:
        return '/functions/ai-proxy';
      case Platform.VERCEL:
      case Platform.NETLIFY:
        return '/api/ai-proxy';
      case Platform.GITHUB_PAGES:
        // GitHub Pages需要配置外部代理服务
        // 可以使用Vercel/Cloudflare的免费套餐部署代理
        const externalProxy = window.EXTERNAL_PROXY_URL;
        if (externalProxy) {
          return externalProxy;
        }
        logger.warn('envDetect', 'GitHub Pages detected but no external proxy configured');
        return '/api/ai-proxy'; // 回退到相对路径
      default:
        return '/api/ai-proxy';
    }
  }

  // 本地开发环境
  return 'http://localhost:5000/api/proxy';
}

/**
 * 自动路由：获取云同步后端端点地址
 */
export function getSyncApiUrl(platform = null) {
  const detectedPlatform = platform || detectPlatform();

  if (detectedPlatform !== Platform.LOCAL) {
    switch (detectedPlatform) {
      case Platform.CLOUDFLARE:
        return '/functions/sync';
      case Platform.VERCEL:
      case Platform.NETLIFY:
        return '/api/sync';
      case Platform.GITHUB_PAGES:
        const externalSync = window.EXTERNAL_SYNC_URL;
        if (externalSync) {
          return externalSync;
        }
        return '/api/sync';
      default:
        return '/api/sync';
    }
  }

  return 'http://localhost:5000/api/sync';
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
  };

  // 平台特定配置
  const platformConfigs = {
    [Platform.VERCEL]: {
      ...baseConfig,
      timeout: 300, // Vercel Pro支持300秒
      features: {
        serverlessFunctions: true,
        edgeRuntime: true,
        analytics: true,
      }
    },
    [Platform.NETLIFY]: {
      ...baseConfig,
      timeout: 300, // Netlify Pro支持300秒
      features: {
        serverlessFunctions: true,
        edgeFunctions: true,
        splitTesting: true,
      }
    },
    [Platform.CLOUDFLARE]: {
      ...baseConfig,
      timeout: 300, // Cloudflare Workers默认支持长时间运行
      features: {
        workers: true,
        kv: true,
        d1: true,
        durable: true,
      }
    },
    [Platform.GITHUB_PAGES]: {
      ...baseConfig,
      timeout: 60,
      features: {
        staticOnly: true,
        externalApiRequired: true,
      }
    },
    [Platform.LOCAL]: {
      ...baseConfig,
      timeout: 300,
      features: {
        hotReload: true,
        debugging: true,
      }
    }
  };

  return platformConfigs[detectedPlatform] || baseConfig;
}

/**
 * 环境感知初始化
 * 将识别出的配置注入全局 window 对象，供后续服务层直接调用
 */
export function initializeEnvironment() {
  const config = getPlatformConfig();
  
  logger.info('envDetect', 'Environment initialized', {
    platform: config.platform,
    isProduction: config.isProduction,
    proxyUrl: config.proxyUrl,
    syncUrl: config.syncUrl
  });

  // 存储到全局对象供其他模块使用
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
