/**
 * 请求身份认证模块（Cloudflare Workers 版）
 * 基于 syncId 所有权校验，防止越权访问他人同步数据。
 * 使用 Web Crypto API，兼容 Cloudflare Workers 运行时。
 *
 * 认证方式：
 *   客户端在请求头中携带以下两个字段：
 *   - X-Sync-Token: HMAC-SHA256(syncId + ":" + timestamp, syncId)，十六进制编码
 *   - X-Timestamp:  Unix 时间戳（毫秒），用于防重放攻击
 *
 * 设计说明：
 *   syncId 由用户主密码经 PBKDF2 单向派生，对每个用户唯一且不可逆推密码。
 *   以 syncId 自身作为签名密钥，服务端用路径中的 syncId 验签，
 *   只有能派生出正确 syncId 的客户端才能通过校验，无需在服务端存储任何共享密钥。
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
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(message));
  return uint8ArrayToHex(new Uint8Array(signature));
}

/**
 * 使用恒定时间比较两个等长字符串，防止时序攻击
 * @param {string} a
 * @param {string} b
 * @returns {boolean}
 */
function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * 校验请求中的身份认证信息
 *
 * @param {Request} request - Cloudflare Workers Request 对象
 * @param {string}  syncId  - 从路径参数中提取的 syncId
 * @returns {Promise<{ ok: boolean, response: Response|null }>}
 *   ok 为 true 时校验通过，response 为 null；
 *   ok 为 false 时校验失败，response 为已构造的错误响应。
 */
async function verifyAuth(request, syncId) {
  if (!syncId) {
    return {
      ok: false,
      response: jsonResponse({ success: false, error: 'Missing required field: syncId' }, 400)
    };
  }

  if (typeof syncId !== 'string' || !HEX_REGEX.test(syncId) || syncId.length < 32) {
    return {
      ok: false,
      response: jsonResponse({ success: false, error: 'Invalid syncId format' }, 400)
    };
  }

  const token     = request.headers.get('x-sync-token');
  const timestamp = request.headers.get('x-timestamp');

  if (!token || !timestamp) {
    return {
      ok: false,
      response: jsonResponse({
        success: false,
        error: 'Missing authentication headers: X-Sync-Token, X-Timestamp'
      }, 401)
    };
  }

  const ts = parseInt(timestamp, 10);
  if (isNaN(ts) || Math.abs(Date.now() - ts) > TIMESTAMP_WINDOW_MS) {
    return {
      ok: false,
      response: jsonResponse({ success: false, error: 'Request timestamp is expired or invalid' }, 401)
    };
  }

  const expected = await computeHmac(`${syncId}:${timestamp}`, syncId);

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

  if (!timingSafeEqual(token.toLowerCase(), expected.toLowerCase())) {
    return {
      ok: false,
      response: jsonResponse({ success: false, error: 'Invalid authentication token' }, 401)
    };
  }

  return { ok: true, response: null };
}

/**
 * 校验全局访问密码 (AUTH_SECRET)
 * 如果服务端配置了 AUTH_SECRET 环境变量，则要求客户端在 X-Authorization 中携带匹配的值。
 *
 * @param {Request} request - Cloudflare Workers Request 对象
 * @param {object} env - 环境变量对象
 * @returns {Promise<{ ok: boolean, response: Response|null }>}
 */
async function verifyGlobalAuth(request, env) {
  const secret = env.AUTH_SECRET;
  if (!secret) return { ok: true, response: null };

  const authHeader = request.headers.get('x-authorization');
  if (!authHeader || authHeader !== secret) {
    return {
      ok: false,
      response: jsonResponse({
        success: false,
        error: 'Invalid or missing global access code'
      }, 401)
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

export { verifyAuth, verifyGlobalAuth, jsonResponse };
