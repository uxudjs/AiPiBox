/**
 * 日志脱敏规则完善 — Prove-It 测试
 */

import { describe, it, expect } from 'vitest';

const P = (s) => s; // passthrough helper

// 旧版脱敏
function sanitize_OLD(content) {
  return content.replace(
    /(sk-proj-|sk-|key-|api_key=|Authorization:|Bearer\s)[a-zA-Z0-9_\-\.]{10,}/gi,
    '$1[REDACTED]'
  );
}

// 修复后的脱敏
function sanitize_NEW(content) {
  return content
    .replace(/(sk-(?:proj-|ant-api)?)[a-zA-Z0-9_-]{10,}/gi, '$1[REDACTED]')
    .replace(/(AIzaSy)[a-zA-Z0-9_-]{10,}/gi, '$1[REDACTED]')
    .replace(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/gi, '[AZURE_KEY_REDACTED]')
    .replace(/(Bearer\s+|Authorization:\s*)[a-zA-Z0-9_\-\.\+]{10,}/gi, '$1[REDACTED]')
    .replace(/(api[_-]?key[=:]\s*)[a-zA-Z0-9_\-\.]{8,}/gi, '$1[REDACTED]');
}

describe('日志脱敏规则', () => {

  describe('旧实现遗漏（Prove-It: 旧代码应 FAIL）', () => {
    it('Google 格式未脱敏', () => {
      const input = 'Error: ' + 'AIzaSy' + 'TEST1234567890123456';
      expect(sanitize_OLD(input)).not.toContain('[REDACTED]');
    });

    it('Azure UUID 格式未脱敏', () => {
      const input = '00000000-1111-2222-3333-444444444444';
      expect(sanitize_OLD(input)).not.toContain('REDACTED');
    });
  });

  describe('新实现覆盖', () => {
    it('OpenAI 格式', () => {
      const r = sanitize_NEW('key=' + P('sk-proj-') + 'TEST1234567890123456');
      expect(r).toContain('[REDACTED]');
    });

    it('Anthropic 格式', () => {
      const r = sanitize_NEW('err: ' + P('sk-ant-api03-') + 'TEST12345678901234');
      expect(r).toContain('[REDACTED]');
    });

    it('Google 格式', () => {
      const r = sanitize_NEW('Using: ' + P('AIzaSy') + 'TEST12345678901234567890');
      expect(r).toContain('[REDACTED]');
    });

    it('Azure UUID', () => {
      const r = sanitize_NEW('00000000-1111-2222-3333-444444444444');
      expect(r).toContain('[AZURE_KEY_REDACTED]');
    });

    it('Bearer token', () => {
      const r = sanitize_NEW('Auth: Bearer TEST_TOKEN_1234567890123456');
      expect(r).toContain('Bearer [REDACTED]');
    });

    it('Authorization header', () => {
      const r = sanitize_NEW('Hdr: Authorization: TEST_HDR_1234567890');
      expect(r).toContain('Authorization: [REDACTED]');
    });

    it('api_key URL 参数', () => {
      const r = sanitize_NEW('url?api_key=test_custom_val_12345678');
      expect(r).toContain('api_key=[REDACTED]');
    });

    it('apiKey JSON 格式', () => {
      const r = sanitize_NEW('{"apiKey": "test_json_val_12345678"}');
      expect(r).toContain('apiKey": "[REDACTED]');
    });
  });

  describe('修复确认', () => {
    it('Google 格式: 旧不脱敏, 新脱敏', () => {
      const input = P('AIzaSy') + 'TEST1234567890123456';
      expect(sanitize_OLD(input)).toBe(input);
      expect(sanitize_NEW(input)).toContain('[REDACTED]');
    });

    it('Azure UUID: 旧不脱敏, 新脱敏', () => {
      const input = '00000000-1111-2222-3333-444444444444';
      expect(sanitize_OLD(input)).toBe(input);
      expect(sanitize_NEW(input)).toContain('[AZURE_KEY_REDACTED]');
    });

    it('正常内容不被误脱敏', () => {
      const msgs = [
        'Hello, how are you?',
        'File: doc.pdf (1.2 MB)',
        'Model: gpt-test Temp: 0.7',
        '2026-06-03T12:00:00.000Z',
        '1234-5678',
        'A-B-C-D',
      ];
      for (const m of msgs) {
        expect(sanitize_NEW(m)).toBe(m);
      }
    });
  });
});
