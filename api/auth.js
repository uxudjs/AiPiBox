/**
 * 请求身份认证模块
 * 提供基于 HMAC-SHA256 签名的 userId 身份校验，防止越权访问同步接口。
 *
 * 认证方式：
 *   客户端在请求头中携带以下三个字段：
 *   - X-User-Id:    用户 ID
 *   - X-Auth-Token: HMAC-SHA256(userId + ":" + timestamp, AUTH_SECRET)，十六进制编码
 *   - X-Timestamp:  Unix 时间戳（毫秒），用于防重放攻击
 *
 * 环境变量：
 *   AUTH_SECRET  用于签名的密钥，生产环境必须设置
 */

const crypto = require('crypto');

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
 * 计算 HMAC-SHA256 签名
 * @param {string} message - 待签名消息
 * @param {string} secret  - 签名密钥
 * @returns {string} 十六进制签名字符串
 */
function computeHmac(message, secret) {
  return crypto.createHmac('sha256', secret).update(message).digest('hex');
}

/**
 * 校验请求中的身份认证信息
 *
 * @param {object} req        - HTTP 请求对象
 * @param {object} res        - HTTP 响应对象
 * @param {string} bodyUserId - 从请求体或查询参数中提取的 userId
 * @returns {boolean} 校验通过返回 true，否则已写入响应并返回 false
 */
function verifyAuth(req, res, bodyUserId) {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    console.error('[Auth] AUTH_SECRET is not configured');
    res.status(500).json({
      success: false,
      error: 'Server configuration error'
    });
    return false;
  }

  const headerUserId = req.headers['x-user-id'];
  const token        = req.headers['x-auth-token'];
  const timestamp    = req.headers['x-timestamp'];

  if (!headerUserId || !token || !timestamp) {
    res.status(401).json({
      success: false,
      error: 'Missing authentication headers: X-User-Id, X-Auth-Token, X-Timestamp'
    });
    return false;
  }

  // 校验时间戳，防止重放攻击
  const ts = parseInt(timestamp, 10);
  if (isNaN(ts) || Math.abs(Date.now() - ts) > TIMESTAMP_WINDOW_MS) {
    res.status(401).json({
      success: false,
      error: 'Request timestamp is expired or invalid'
    });
    return false;
  }

  // 计算期望签名
  const expected = computeHmac(`${headerUserId}:${timestamp}`, secret);

  // 校验 token 格式：必须是合法十六进制字符串，且长度与期望签名一致。
  // timingSafeEqual 要求两端 Buffer 长度完全相同，否则抛 RangeError。
  // 提前做格式与长度校验，避免异常并防止时序侧信道攻击。
  if (
    typeof token !== 'string' ||
    !HEX_REGEX.test(token) ||
    token.length !== expected.length
  ) {
    res.status(401).json({
      success: false,
      error: 'Invalid authentication token'
    });
    return false;
  }

  // 使用恒定时间比较，防止时序攻击
  const tokenBuf    = Buffer.from(token,    'hex');
  const expectedBuf = Buffer.from(expected, 'hex');

  if (!crypto.timingSafeEqual(tokenBuf, expectedBuf)) {
    res.status(401).json({
      success: false,
      error: 'Invalid authentication token'
    });
    return false;
  }

  // 校验请求体 userId 与请求头 userId 一致，防止越权操作他人数据
  if (bodyUserId && headerUserId !== String(bodyUserId)) {
    res.status(403).json({
      success: false,
      error: 'Forbidden: userId mismatch'
    });
    return false;
  }

  return true;
}

module.exports = { verifyAuth };
