/**
 * 请求身份认证模块
 * 基于 syncId 所有权校验，防止越权访问他人同步数据。
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
 * @param {object} req    - HTTP 请求对象
 * @param {object} res    - HTTP 响应对象
 * @param {string} syncId - 从路径参数或请求体中提取的 syncId
 * @returns {boolean} 校验通过返回 true，否则已写入响应并返回 false
 */
function verifyAuth(req, res, syncId) {
  if (!syncId) {
    res.status(400).json({
      success: false,
      error: 'Missing required field: syncId'
    });
    return false;
  }

  if (typeof syncId !== 'string' || !HEX_REGEX.test(syncId) || syncId.length < 32) {
    res.status(400).json({
      success: false,
      error: 'Invalid syncId format'
    });
    return false;
  }

  const token     = req.headers['x-sync-token'];
  const timestamp = req.headers['x-timestamp'];

  if (!token || !timestamp) {
    res.status(401).json({
      success: false,
      error: 'Missing authentication headers: X-Sync-Token, X-Timestamp'
    });
    return false;
  }

  const ts = parseInt(timestamp, 10);
  if (isNaN(ts) || Math.abs(Date.now() - ts) > TIMESTAMP_WINDOW_MS) {
    res.status(401).json({
      success: false,
      error: 'Request timestamp is expired or invalid'
    });
    return false;
  }

  const expected = computeHmac(`${syncId}:${timestamp}`, syncId);

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

  const tokenBuf    = Buffer.from(token,    'hex');
  const expectedBuf = Buffer.from(expected, 'hex');

  if (!crypto.timingSafeEqual(tokenBuf, expectedBuf)) {
    res.status(401).json({
      success: false,
      error: 'Invalid authentication token'
    });
    return false;
  }

  return true;
}

/**
 * 校验全局访问密码 (AUTH_SECRET)
 * 如果服务端配置了 AUTH_SECRET 环境变量，则要求客户端在 X-Authorization 中携带匹配的值。
 *
 * @param {object} req - HTTP 请求对象
 * @param {object} res - HTTP 响应对象
 * @returns {boolean} 校验通过返回 true，否则已写入响应并返回 false
 */
function verifyGlobalAuth(req, res) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return true; // 未配置则默认通过

  const authHeader = req.headers['x-authorization'];
  if (!authHeader || authHeader !== secret) {
    res.status(401).json({
      success: false,
      error: 'Invalid or missing global access code'
    });
    return false;
  }

  return true;
}

module.exports = { verifyAuth, verifyGlobalAuth };
