/**
 * 文件上传魔术字节校验 — Prove-It 测试
 *
 * 漏洞：仅检查 file.type，攻击者可修改 MIME 类型绕过。
 * 修复：添加魔术字节检测 + SVG 安全校验。
 */

import { describe, it, expect } from 'vitest';

// ─── 魔术字节签名 ───
const IMAGE_MAGIC_BYTES = {
  png:  { offset: 0, bytes: [0x89, 0x50, 0x4E, 0x47] },
  jpeg: { offset: 0, bytes: [0xFF, 0xD8, 0xFF] },
  gif:  { offset: 0, bytes: [0x47, 0x49, 0x46, 0x38] },
  webp: { offset: 0, bytes: [0x52, 0x49, 0x46, 0x46] },
};

function checkMagicBytes(buffer, signature) {
  if (buffer.length < signature.offset + signature.bytes.length) return false;
  return signature.bytes.every((b, i) => buffer[signature.offset + i] === b);
}

function validateImageByType(buffer, ext) {
  const sig = IMAGE_MAGIC_BYTES[ext];
  if (!sig) return false;
  return checkMagicBytes(buffer, sig);
}

// ─── SVG 安全检测 ───
function isSvgSafe(text) {
  const dangerous = /<script[\s>]|on\w+\s*=|javascript:|<use\b.*\bxlink:href\s*=\s*["'](?!data:)/i;
  return !dangerous.test(text);
}

// ─── 旧版检查（仅 MIME） ───
function isImage_OLD(file) {
  return file.type.startsWith('image/');
}

// ─── 新版检查（MIME + 魔术字节） ───
async function isImage_NEW(file) {
  if (!file.type.startsWith('image/')) return false;

  // SVG 特殊处理
  if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
    const text = await file.text();
    return isSvgSafe(text);
  }

  // 位图：魔术字节检查
  const ext = file.name.split('.').pop()?.toLowerCase();
  const sig = IMAGE_MAGIC_BYTES[ext] || IMAGE_MAGIC_BYTES.jpeg;
  const slice = file.slice(sig.offset, sig.offset + sig.bytes.length);
  const buffer = new Uint8Array(await slice.arrayBuffer());
  return checkMagicBytes(buffer, sig);
}

function makeMockFile(name, type, content) {
  return new File([content], name, { type });
}

describe('文件上传魔术字节校验', () => {

  describe('旧实现（仅 MIME 检查）的漏洞', () => {
    it('伪装成 PNG 的文本文件通过旧检查', () => {
      const fake = makeMockFile('evil.png', 'image/png', 'Hello World');
      expect(isImage_OLD(fake)).toBe(true); // 旧代码放行
    });

    it('伪装成 JPEG 的可执行文件通过旧检查', () => {
      const fake = makeMockFile('virus.jpg', 'image/jpeg', '#!/bin/sh\nrm -rf /');
      expect(isImage_OLD(fake)).toBe(true); // 旧代码放行
    });

    it('伪装成 GIF 的恶意脚本通过旧检查', () => {
      const fake = makeMockFile('payload.gif', 'image/gif', '<script>alert(1)</script>');
      expect(isImage_OLD(fake)).toBe(true); // 旧代码放行
    });

    it('危险 SVG 通过旧检查', () => {
      const svg = '<svg><script>alert("XSS")</script></svg>';
      const fake = makeMockFile('xss.svg', 'image/svg+xml', svg);
      expect(isImage_OLD(fake)).toBe(true); // 旧代码放行
    });
  });

  describe('魔术字节检测单元', () => {
    it('有效 PNG 魔术字节', () => {
      const buf = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
      expect(checkMagicBytes(buf, IMAGE_MAGIC_BYTES.png)).toBe(true);
    });

    it('有效 JPEG 魔术字节', () => {
      const buf = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10]);
      expect(checkMagicBytes(buf, IMAGE_MAGIC_BYTES.jpeg)).toBe(true);
    });

    it('有效 GIF 魔术字节', () => {
      const buf = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);
      expect(checkMagicBytes(buf, IMAGE_MAGIC_BYTES.gif)).toBe(true);
    });

    it('有效 WebP 魔术字节', () => {
      const buf = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50]);
      expect(checkMagicBytes(buf, IMAGE_MAGIC_BYTES.webp)).toBe(true);
    });

    it('文本文件不是 PNG', () => {
      const buf = new TextEncoder().encode('Hello World');
      expect(checkMagicBytes(buf, IMAGE_MAGIC_BYTES.png)).toBe(false);
    });

    it('HTML 文件不是 JPEG', () => {
      const buf = new TextEncoder().encode('<html></html>');
      expect(checkMagicBytes(buf, IMAGE_MAGIC_BYTES.jpeg)).toBe(false);
    });

    it('空 Buffer', () => {
      expect(checkMagicBytes(new Uint8Array(0), IMAGE_MAGIC_BYTES.png)).toBe(false);
    });

    it('Buffer 太短', () => {
      expect(checkMagicBytes(new Uint8Array([0x89]), IMAGE_MAGIC_BYTES.png)).toBe(false);
    });
  });

  describe('SVG 安全检测', () => {
    it('正常 SVG 通过', () => {
      expect(isSvgSafe('<svg><rect width="100" height="100"/></svg>')).toBe(true);
    });

    it('SVG 含 script 标签被拒绝', () => {
      expect(isSvgSafe('<svg><script>alert(1)</script></svg>')).toBe(false);
    });

    it('SVG 含事件处理器被拒绝', () => {
      expect(isSvgSafe('<svg><rect onclick="alert(1)"/></svg>')).toBe(false);
    });

    it('SVG 含 javascript: URL 被拒绝', () => {
      expect(isSvgSafe('<svg><a href="javascript:alert(1)">click</a></svg>')).toBe(false);
    });

    it('SVG 含 onload 被拒绝', () => {
      expect(isSvgSafe('<svg onload="alert(1)"></svg>')).toBe(false);
    });
  });

  describe('新实现（MIME + 魔术字节）验证', () => {
    it('合法 PNG 通过', async () => {
      const pngHeader = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D]);
      const file = makeMockFile('test.png', 'image/png', pngHeader);
      const result = await isImage_NEW(file);
      expect(result).toBe(true);
    });

    it('伪装成 PNG 的文本被拒绝', async () => {
      const file = makeMockFile('fake.png', 'image/png', 'Not a PNG file!');
      const result = await isImage_NEW(file);
      expect(result).toBe(false);
    });

    it('合法 JPEG 通过', async () => {
      const jpegHeader = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46]);
      const file = makeMockFile('test.jpg', 'image/jpeg', jpegHeader);
      const result = await isImage_NEW(file);
      expect(result).toBe(true);
    });

    it('伪装成 JPEG 的文本被拒绝', async () => {
      const file = makeMockFile('fake.jpg', 'image/jpeg', 'Fake JPEG content');
      const result = await isImage_NEW(file);
      expect(result).toBe(false);
    });

    it('非图片 MIME 直接拒绝', async () => {
      const file = makeMockFile('doc.pdf', 'application/pdf', 'PDF content');
      const result = await isImage_NEW(file);
      expect(result).toBe(false);
    });
  });

  describe('修复确认', () => {
    it('旧的 MIME-only 检查对伪装的恶意文件全部放行', () => {
      const evilFiles = [
        makeMockFile('evil.png', 'image/png', 'malware'),
        makeMockFile('virus.jpg', 'image/jpeg', '#!/bin/sh'),
        makeMockFile('xss.svg', 'image/svg+xml', '<svg onload="alert(1)"/>'),
      ];
      for (const f of evilFiles) {
        expect(isImage_OLD(f)).toBe(true);
      }
    });

    it('新的魔术字节检查拒绝伪装的恶意文件', async () => {
      const fakePng = makeMockFile('evil.png', 'image/png', 'malware content');
      const fakeJpeg = makeMockFile('virus.jpg', 'image/jpeg', '#!/bin/sh');
      const evilSvg = makeMockFile('xss.svg', 'image/svg+xml', '<svg onload="xss"/>');

      expect(await isImage_NEW(fakePng)).toBe(false);
      expect(await isImage_NEW(fakeJpeg)).toBe(false);
      expect(await isImage_NEW(evilSvg)).toBe(false);
    });
  });
});
