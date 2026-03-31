/**
 * 同步数据上传接口
 * 接收客户端加密数据并持久化到云端，支持版本控制。
 */

const { query, beginTransaction } = require('../db-config');
const { verifyAuth, verifyGlobalAuth } = require('../auth');

/**
 * 请求体中 encryptedData 字段允许的最大字节长度（10 MB）
 */
const MAX_ENCRYPTED_DATA_BYTES = 10 * 1024 * 1024;

/**
 * 上传处理程序
 * @param {object} req - HTTP 请求对象
 * @param {object} res - HTTP 响应对象
 */
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  // 前端上传时 body 字段为 { id, data, timestamp }
  const { id: syncId, data: encryptedData, timestamp } = req.body;

  // 全局访问权限校验
  if (!verifyGlobalAuth(req, res)) {
    return;
  }

  // 必填字段校验须在 verifyAuth 之前执行，
  // 确保 syncId 非空后再传入 verifyAuth 做签名校验。
  if (!syncId || !encryptedData) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: id, data'
    });
  }

  if (!verifyAuth(req, res, syncId)) {
    return;
  }

  try {
    if (Buffer.byteLength(String(encryptedData), 'utf8') > MAX_ENCRYPTED_DATA_BYTES) {
      return res.status(413).json({
        success: false,
        error: 'Payload too large: data exceeds the 10 MB limit'
      });
    }

    const version = timestamp || Date.now();

    const transaction = await beginTransaction();

    try {
      const existing = await transaction.query(
        'SELECT sync_id FROM sync_data WHERE sync_id = ?',
        [syncId]
      );

      if (existing.length > 0) {
        await transaction.query(
          'UPDATE sync_data SET data_content = ?, version = ?, updated_at = NOW() WHERE sync_id = ?',
          [encryptedData, version, syncId]
        );
      } else {
        await transaction.query(
          'INSERT INTO sync_data (sync_id, data_content, version, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
          [syncId, encryptedData, version]
        );
      }

      await transaction.commit();

      return res.status(200).json({
        success:   true,
        version:   version,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      success:   false,
      error:     'An internal error occurred. Please try again later.',
      timestamp: new Date().toISOString()
    });
  }
};
