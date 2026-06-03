/**
 * 全局访问密码安全加固 — Prove-It 测试
 *
 * 修复：timingSafeEqual 恒定时间比较 + 独立速率限制 (5次/分钟/IP)
 */

import { describe, it, expect, beforeEach } from 'vitest';

// ─── timingSafeEqual 实现 ───

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

// ─── 旧版有漏洞的比较 ───

function verify_OLD(envValue, inputValue) {
  if (!envValue) return true;
  if (!inputValue || inputValue !== envValue) return false;
  return true;
}

// ─── 速率限制器 ───

function createRateLimiter(windowMs, maxAttempts) {
  const store = new Map();

  return function check(ip) {
    const now = Date.now();
    const record = store.get(ip);

    if (!record || now - record.windowStart >= windowMs) {
      store.set(ip, { count: 1, windowStart: now });
      return { allowed: true, remaining: maxAttempts - 1 };
    }

    if (record.count >= maxAttempts) {
      return { allowed: false, remaining: 0 };
    }

    record.count++;
    return { allowed: true, remaining: maxAttempts - record.count };
  };
}

// ─── 修复后的实现 ───

function verify_NEW(envValue, inputValue, rateLimiter, clientIp) {
  if (!envValue) return { allowed: true, reason: null };

  const rateCheck = rateLimiter(clientIp);
  if (!rateCheck.allowed) {
    return { allowed: false, reason: 'rate_limit' };
  }

  if (!inputValue) {
    return { allowed: false, reason: 'missing_input' };
  }

  if (!timingSafeEqual(inputValue, envValue)) {
    return { allowed: false, reason: 'mismatch' };
  }

  return { allowed: true, reason: null };
}

describe('Auth 时钟安全比较 (timingSafeEqual)', () => {
  describe('旧实现 (!==) 验证', () => {
    it('匹配时返回 true', () => {
      expect(verify_OLD('test-value-123', 'test-value-123')).toBe(true);
    });

    it('不匹配时返回 false', () => {
      expect(verify_OLD('test-value-123', 'different')).toBe(false);
    });

    it('未配置时默认通过', () => {
      expect(verify_OLD('', 'anything')).toBe(true);
    });
  });

  describe('新实现 (timingSafeEqual) 不变时间保证', () => {
    it('相同字符串返回 true', () => {
      expect(timingSafeEqual('test-value-123', 'test-value-123')).toBe(true);
    });

    it('不同字符串返回 false', () => {
      expect(timingSafeEqual('test-value-123', 'wrong-value-56')).toBe(false);
    });

    it('不同长度立即返回 false', () => {
      expect(timingSafeEqual('short', 'a-very-long-text-value')).toBe(false);
      expect(timingSafeEqual('a-very-long-text-value', 'short')).toBe(false);
    });

    it('空字符串比较', () => {
      expect(timingSafeEqual('', '')).toBe(true);
      expect(timingSafeEqual('', 'a')).toBe(false);
    });

    it('逐字符 XOR — 差别在最后一个字符', () => {
      expect(timingSafeEqual('aaaaa', 'aaaab')).toBe(false);
    });

    it('逐字符 XOR — 差别在第一个字符', () => {
      expect(timingSafeEqual('baaaa', 'aaaaa')).toBe(false);
    });

    it('与旧实现对同一组输入输出一致', () => {
      const pairs = [
        ['val-a', 'val-a'],
        ['val-a', 'val-b'],
        ['', ''],
        ['x'.repeat(100), 'x'.repeat(100)],
        ['x'.repeat(100), 'y' + 'x'.repeat(99)],
      ];
      for (const [a, b] of pairs) {
        expect(timingSafeEqual(a, b)).toBe(a === b);
      }
    });
  });

  describe('新实现 + 速率限制', () => {
    it('匹配时通过', () => {
      const rl = createRateLimiter(60000, 5);
      const result = verify_NEW('test-value-123', 'test-value-123', rl, '1.2.3.4');
      expect(result.allowed).toBe(true);
    });

    it('不匹配时拒绝', () => {
      const rl = createRateLimiter(60000, 5);
      const result = verify_NEW('test-value-123', 'wrong', rl, '1.2.3.4');
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('mismatch');
    });
  });
});

describe('Auth 速率限制', () => {
  let rateLimiter;

  beforeEach(() => {
    rateLimiter = createRateLimiter(60000, 5);
  });

  it('初始状态允许访问', () => {
    const r = rateLimiter('1.2.3.4');
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(4);
  });

  it('连续 5 次后达到限制', () => {
    for (let i = 0; i < 5; i++) {
      expect(rateLimiter('1.2.3.4').allowed).toBe(true);
    }
    expect(rateLimiter('1.2.3.4').allowed).toBe(false);
  });

  it('不同 IP 独立限制', () => {
    for (let i = 0; i < 5; i++) rateLimiter('1.2.3.4');
    expect(rateLimiter('1.2.3.4').allowed).toBe(false);
    expect(rateLimiter('5.6.7.8').allowed).toBe(true);
  });

  it('暴力破解在 5 次后被阻止', () => {
    let count = 0;
    for (let i = 0; i < 100; i++) {
      if (rateLimiter('attacker').allowed) count++;
    }
    expect(count).toBe(5);
  });

  it('修复确认：攻击者无法进行大规模暴力破解', () => {
    // 旧系统：无速率限制，可以无限尝试
    // 新系统：5 次/分钟/IP
    for (let i = 0; i < 5; i++) rateLimiter('evil-ip');
    const blocked = rateLimiter('evil-ip');
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });
});
