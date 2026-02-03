/**
 * 客户端加密工具模块
 * 基于 Web Crypto API 实现高强度的本地数据加密与密钥派生
 */

// PBKDF2 迭代次数，权衡安全性能
const ITERATIONS = 100000;
// 采用 AES-GCM 算法（支持关联数据的认证加密）
const ALGO = 'AES-GCM';
// 密钥长度 256 位
const KEY_LEN = 256;

/**
 * 从主密码派生对称密钥
 * 结合随机盐值使用 PBKDF2-HMAC-SHA256 进行派生
 */
async function deriveKey(password, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ALGO, length: KEY_LEN },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * 高级数据加密
 * 将 JSON 对象加密为包含 [Salt(16B) + IV(12B) + Payload] 的 Base64 字符串
 */
export async function encryptData(data, password) {
  const enc = new TextEncoder();
  // 生成随机盐值（16字节）
  const salt = crypto.getRandomValues(new Uint8Array(16));
  // 生成随机初始化向量（12字节）
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  
  // 执行加密操作
  const encrypted = await crypto.subtle.encrypt(
    { name: ALGO, iv },
    key,
    enc.encode(JSON.stringify(data))
  );

  // 将盐值、IV和加密数据合并为一个数组
  const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encrypted), salt.length + iv.length);
  
  // 转换为Base64格式返回（分块处理避免栈溢出）
  let binary = '';
  const chunkSize = 8192; // 每次处理8KB
  for (let i = 0; i < combined.length; i += chunkSize) {
    const chunk = combined.subarray(i, Math.min(i + chunkSize, combined.length));
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

/**
 * 数据解密还原
 */
export async function decryptData(encryptedBase64, password) {
  try {
    // 解码Base64并转换为字节数组
    const combined = new Uint8Array(
      atob(encryptedBase64).split('').map(c => c.charCodeAt(0))
    );
    // 提取盐值（16字节）
    const salt = combined.slice(0, 16);
    // 提取IV（12字节）
    const iv = combined.slice(16, 28);
    const data = combined.slice(28);
    
    const key = await deriveKey(password, salt);
    const decrypted = await crypto.subtle.decrypt(
      { name: ALGO, iv },
      key,
      data
    );
    
    return JSON.parse(new TextDecoder().decode(decrypted));
  } catch (e) {
    throw new Error('解密失败：密码错误或数据损坏');
  }
}

/**
 * 单向哈希摘要
 * 用于密码验证与数据完整性校验
 */
export function hashPassword(password) {
  const enc = new TextEncoder();
  return crypto.subtle.digest('SHA-256', enc.encode(password))
    .then(hash => Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0')).join(''));
}
