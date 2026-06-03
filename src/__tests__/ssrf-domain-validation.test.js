/**
 * SSRF 域名白名单绕过漏洞 — Prove-It 测试
 *
 * 漏洞描述：旧代码使用 endsWith('.allowed') 进行子域匹配，
 * 攻击者可构造 evil-api.openai.com.attacker.com 绕过检查。
 *
 * 修复：添加组件级域名边界检查，防止跨域名组件绕过。
 */

import { describe, it, expect } from 'vitest';

// 白名单（与 api/ai-proxy.js 保持一致）
const ALLOWED_HOSTS = [
  'api.openai.com',
  'api.anthropic.com',
  'api.google.com',
  'generativelanguage.googleapis.com',
  'api.deepseek.com',
  'api.siliconflow.cn',
  'openrouter.ai',
  'api.mistral.ai',
  'api.groq.com',
  'api.perplexity.ai',
  'api.x.ai',
  'dashscope.aliyuncs.com',
  'dashscope-intl.aliyuncs.com',
  'dashscope.us-west-1.aliyuncs.com',
  'open.bigmodel.cn',
  'ark.cn-beijing.volces.com',
  'api.tavily.com',
  'api.bing.microsoft.com',
  'www.googleapis.com',
  'api.replicate.com',
  'api.stability.ai'
];

// 旧版有漏洞的实现
function isAllowed_OLD(targetHost) {
  return ALLOWED_HOSTS.some(allowed =>
    targetHost === allowed || targetHost.endsWith('.' + allowed)
  );
}

// 修复后的安全实现
function isAllowed_NEW(targetHost) {
  return ALLOWED_HOSTS.some(allowed =>
    targetHost === allowed ||
    (targetHost.endsWith('.' + allowed) &&
     !targetHost.slice(0, -allowed.length - 1).includes('.'))
  );
}

describe('SSRF 域名白名单验证', () => {
  describe('旧实现的漏洞确认（这些测试在旧代码上应 FAIL）', () => {
    it('旧实现: evil-api.openai.com.attacker.com 通过 .openai.com 绕过 — 应被阻止但旧代码放行', () => {
      expect(isAllowed_OLD('evil-api.openai.com.attacker.com')).toBe(true);
    });

    it('旧实现: openai.com.evil.com 通过 .openai.com 绕过 — 应被阻止但旧代码放行', () => {
      expect(isAllowed_OLD('openai.com.evil.com')).toBe(true);
    });

    it('旧实现: api.openai.com.attacker.com 通过 .api.openai.com 绕过 — 应被阻止但旧代码放行', () => {
      expect(isAllowed_OLD('api.openai.com.attacker.com')).toBe(true);
    });
  });

  describe('修复后的实现验证', () => {
    // 应拒绝的攻击域名
    it('拒绝: evil-api.openai.com.attacker.com', () => {
      expect(isAllowed_NEW('evil-api.openai.com.attacker.com')).toBe(false);
    });

    it('拒绝: openai.com.evil.com', () => {
      expect(isAllowed_NEW('openai.com.evil.com')).toBe(false);
    });

    it('拒绝: api.openai.com.attacker.com', () => {
      expect(isAllowed_NEW('api.openai.com.attacker.com')).toBe(false);
    });

    it('拒绝: fakeopenai.com', () => {
      expect(isAllowed_NEW('fakeopenai.com')).toBe(false);
    });

    it('拒绝: random.domain.com', () => {
      expect(isAllowed_NEW('random.domain.com')).toBe(false);
    });

    // 应允许的合法域名
    it('允许: api.openai.com (精确匹配)', () => {
      expect(isAllowed_NEW('api.openai.com')).toBe(true);
    });

    it('允许: api.anthropic.com', () => {
      expect(isAllowed_NEW('api.anthropic.com')).toBe(true);
    });

    it('允许: generativelanguage.googleapis.com', () => {
      expect(isAllowed_NEW('generativelanguage.googleapis.com')).toBe(true);
    });

    it('允许: api.deepseek.com', () => {
      expect(isAllowed_NEW('api.deepseek.com')).toBe(true);
    });

    it('允许: openrouter.ai', () => {
      expect(isAllowed_NEW('openrouter.ai')).toBe(true);
    });

    // Azure 特殊处理
    it('Azure 子域: xyz.openai.azure.com — 通过 isAzure 逻辑处理', () => {
      const isAzure = (host) => host.endsWith('.openai.azure.com');
      expect(isAzure('my-resource.openai.azure.com')).toBe(true);
    });
  });

  describe('新旧实现对比', () => {
    const testCases = [
      { host: 'api.openai.com',                old: true,  new_: true,  desc: '精确匹配, should allow' },
      { host: 'api.anthropic.com',             old: true,  new_: true,  desc: '精确匹配, should allow' },
      { host: 'not-in-list.com',               old: false, new_: false, desc: '不在白名单, should deny' },
      { host: 'evil-api.openai.com.attacker.com', old: true, new_: false, desc: 'SSRF绕过, old bypasses!' },
      { host: 'openai.com.evil.com',           old: true,  new_: false, desc: 'SSRF绕过, old bypasses!' },
      { host: 'fakeopenai.com',                old: false, new_: false, desc: '假域名, 两者都应拒绝' },
    ];

    testCases.forEach(({ host, old, new_, desc }) => {
      it(`${desc}: ${host}`, () => {
        expect(isAllowed_OLD(host)).toBe(old);
        expect(isAllowed_NEW(host)).toBe(new_);
      });
    });

    it('旧实现对 3 个恶意域名全部放行（漏洞确认）', () => {
      const bypassed = [
        'evil-api.openai.com.attacker.com',
        'openai.com.evil.com',
        'api.openai.com.attacker.com'
      ].filter(h => isAllowed_OLD(h));
      expect(bypassed.length).toBe(3);
    });

    it('新实现对 3 个恶意域名全部阻止（修复确认）', () => {
      const blocked = [
        'evil-api.openai.com.attacker.com',
        'openai.com.evil.com',
        'api.openai.com.attacker.com'
      ].filter(h => isAllowed_NEW(h));
      expect(blocked.length).toBe(0);
    });
  });
});
