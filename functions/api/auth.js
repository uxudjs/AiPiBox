/**
 * 请求身份认证模块（Cloudflare Workers 版）
 * 提供基于 HMAC-SHA256 签名的 userId 身份校验，防止越权访问同步接口。
 * 使用 Web Crypto API，兼容 Cloudflare Workers 运行时。
 *
 * 认证方式：
 *   客户端在请求头中携带以下三个字段：
 *   - X-User-Id:    用户 ID
 *   - X-Auth-Token: HMAC-SHA256(userId + ":" + timestamp, AUTH_SECRET)，十六进制编码
 *   - X-Timestamp:  Unix 时间戳（毫秒），用于防重放攻击
 *
 * 环境变量：
 *   AUTH_SECRET  用于签名的密钥，生产环境必须设置（通过 Cloudflare Pages 环境变量配置）
 */

/**
 * 请求有效时间窗口（毫秒）
 * 超过此范围的时间戳将被拒绝，防止重放攻击。
 */
const TIMESTAMP_WINDOW_MS = 5 * 60 * 1000;

/**
 * 合法十六进制字符串校验正则
 */
const HEX_REGEX = /^[0-9a-f]+$/i;

/**
 * 将十六进制字符串转换为 Uint8Array
 * @param {string} hex - 十六进制字符串
 * @returns {Uint8Array}
 */
function hexToUint8Array(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

/**
 * 将 Uint8Array 转换为十六进制字符串
 * @param {Uint8Array} bytes
 * @returns {string}
 */
function uint8ArrayToHex(bytes) {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * 使用 Web Crypto API 计算 HMAC-SHA256 签名
 * @param {string} message - 待签名消息
 * @param {string} secret  - 签名密钥
 * @returns {Promise<string>} 十六进制签名字符串
 */
async function computeHmac(message, secret) {
  const encoder   = new TextEncoder();
  const keyData   = encoder.encode(secret);
  const msgData   = encoder.encode(message);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, msgData);
  return uint8ArrayToHex(new Uint8Array(signature));
}

/**
 * 使用恒定时间比较两个十六进制字符串，防止时序攻击
 * @param {string} a
 * @param {string} b
 * @returns {boolean}
 */
function timingSafeEqual(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * 校验请求中的身份认证信息
 *
 * @param {Request} request    - Cloudflare Workers Request 对象
 * @param {object}  env        - Cloudflare Workers 环境变量对象
 * @param {string}  bodyUserId - 从请求体或查询参数中提取的 userId
 * @returns {Promise<{ ok: boolean, response: Response|null }>}
 *   ok 为 true 时校验通过，response 为 null；
 *   ok 为 false 时校验失败，response 为已构造的错误响应。
 */
async function verifyAuth(request, env, bodyUserId) {
  const secret = env.AUTH_SECRET;

  if (!secret) {
    console.error('[Auth] AUTH_SECRET is not configured');
    return {
      ok: false,
      response: jsonResponse({ success: false, error: 'Server configuration error' }, 500)
    };
  }

  const headerUserId = request.headers.get('x-user-id');
  const token        = request.headers.get('x-auth-token');
  const timestamp    = request.headers.get('x-timestamp');

  if (!headerUserId || !token || !timestamp) {
    return {
      ok: false,
      response: jsonResponse({
        success: false,
        error: 'Missing authentication headers: X-User-Id, X-Auth-Token, X-Timestamp'
      }, 401)
    };
  }

  // 校验时间戳，防止重放攻击
  const ts = parseInt(timestamp, 10);
  if (isNaN(ts) || Math.abs(Date.now() - ts) > TIMESTAMP_WINDOW_MS) {
    return {
      ok: false,
      response: jsonResponse({ success: false, error: 'Request timestamp is expired or invalid' }, 401)
    };
  }

  // 计算期望签名
  const expected = await computeHmac(`${headerUserId}:${timestamp}`, secret);

  // 校验 token 格式：必须是合法十六进制字符串，且长度与期望签名一致。
  // 提前做格式与长度校验，避免异常并防止时序侧信道攻击。
  if (
    typeof token !== 'string' ||
    !HEX_REGEX.test(token) ||
    token.length !== expected.length
  ) {
    return {
      ok: false,
      response: jsonResponse({ success: false, error: 'Invalid authentication token' }, 401)
    };
  }

  // 使用恒定时间比较，防止时序攻击
  if (!timingSafeEqual(token.toLowerCase(), expected.toLowerCase())) {
    return {
      ok: false,
      response: jsonResponse({ success: false, error: 'Invalid authentication token' }, 401)
    };
  }

  // 校验请求体 userId 与请求头 userId 一致，防止越权操作他人数据
  if (bodyUserId && headerUserId !== String(bodyUserId)) {
    return {
      ok: false,
      response: jsonResponse({ success: false, error: 'Forbidden: userId mismatch' }, 403)
    };
  }

  return { ok: true, response: null };
}

/**
 * 构造 JSON 响应
 * @param {object} body   - 响应体对象
 * @param {number} status - HTTP 状态码
 * @param {object} [extraHeaders] - 额外响应头
 * @returns {Response}
 */
function jsonResponse(body, status, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders }
  });
}

export { verifyAuth, jsonResponse };
