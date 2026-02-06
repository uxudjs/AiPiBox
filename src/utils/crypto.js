/**
 * 客户端加密工具
 * 基于 Web Crypto API 实现高强度的本地数据加密与密钥派生。
 */

const ITERATIONS = 100000;
const ALGO = 'AES-GCM';
const KEY_LEN = 256;

/**
 * 从主密码派生对称密钥
 * @param {Uint8Array} password - 原始密码字节
 * @param {Uint8Array} salt - 随机盐值
 * @returns {Promise<CryptoKey>} 派生后的密钥
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
 * 加密数据
 * @param {any} data - 待加密的数据
 * @param {string} password - 用户密码
 * @returns {Promise<string>} Base64 格式的加密字符串
 */
export async function encryptData(data, password) {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  
  const encrypted = await crypto.subtle.encrypt(
    { name: ALGO, iv },
    key,
    enc.encode(JSON.stringify(data))
  );

  const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encrypted), salt.length + iv.length);
  
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < combined.length; i += chunkSize) {
    const chunk = combined.subarray(i, Math.min(i + chunkSize, combined.length));
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

/**
 * 解密数据
 * @param {string} encryptedBase64 - Base64 格式的加密字符串
 * @param {string} password - 用户密码
 * @returns {Promise<any>} 解密后的原始数据
 */
export async function decryptData(encryptedBase64, password) {
  try {
    const combined = new Uint8Array(
      atob(encryptedBase64).split('').map(c => c.charCodeAt(0))
    );
    const salt = combined.slice(0, 16);
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
 * 计算单向哈希摘要
 * @param {string} password - 待哈希的字符串
 * @returns {Promise<string>} 十六进制哈希字符串
 */
export function hashPassword(password) {
  const enc = new TextEncoder();
  return crypto.subtle.digest('SHA-256', enc.encode(password))
    .then(hash => Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0')).join(''));
}