// @vitest-environment node

import { describe, expect, it, vi } from 'vitest';

vi.mock('../services/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn()
  }
}));

import { getProxyApiUrl, getSyncApiUrl, Platform } from '../utils/envDetect';

describe('Cloudflare-only API 路由', () => {
  it('本地开发使用 Express 代理路由', () => {
    expect(getProxyApiUrl(Platform.LOCAL)).toBe('/api/proxy');
  });

  it('Cloudflare 与自定义域名使用 Pages Functions 路由', () => {
    expect(getProxyApiUrl(Platform.CLOUDFLARE)).toBe('/api/ai-proxy');
    expect(getProxyApiUrl(Platform.UNKNOWN)).toBe('/api/ai-proxy');
    expect(getSyncApiUrl()).toBe('/api/sync');
  });
});
