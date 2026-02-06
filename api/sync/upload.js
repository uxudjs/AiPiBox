/**
 * 同步数据上传接口
 * 接收客户端加密数据并持久化到云端，支持版本控制。
 */

const { query, beginTransaction } = require('../db-config');

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

  try {
    const { userId, dataType, encryptedData, version, checksum } = req.body;

    if (!userId || !dataType || !encryptedData) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId, dataType, encryptedData'
      });
    }

    const validDataTypes = [
      'config',
      'conversations',
      'messages',
      'images',
      'published',
      'knowledgeBases',
      'systemLogs'
    ];

    if (!validDataTypes.includes(dataType)) {
      return res.status(400).json({
        success: false,
        error: `Invalid dataType. Must be one of: ${validDataTypes.join(', ')}`
      });
    }

    const transaction = await beginTransaction();

    try {
      const userExists = await transaction.query(
        'SELECT id FROM users WHERE id = ?',
        [userId]
      );

      if (userExists.length === 0) {
        await transaction.query(
          'INSERT INTO users (id, created_at, last_sync_at) VALUES (?, NOW(), NOW())',
          [userId]
        );
      } else {
        await transaction.query(
          'UPDATE users SET last_sync_at = NOW() WHERE id = ?',
          [userId]
        );
      }

      const existingData = await transaction.query(
        'SELECT id, version FROM sync_data WHERE user_id = ? AND data_type = ?',
        [userId, dataType]
      );

      const newVersion = version || Date.now();

      if (existingData.length > 0) {
        await transaction.query(
          `UPDATE sync_data 
           SET data_content = ?, version = ?, checksum = ?, updated_at = NOW() 
           WHERE user_id = ? AND data_type = ?`,
          [encryptedData, newVersion, checksum, userId, dataType]
        );
      } else {
        await transaction.query(
          `INSERT INTO sync_data (user_id, data_type, data_content, version, checksum, created_at, updated_at) 
           VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
          [userId, dataType, encryptedData, newVersion, checksum]
        );
      }

      await transaction.query(
        `INSERT INTO sync_history (user_id, sync_type, data_types, status, sync_timestamp) 
         VALUES (?, 'upload', ?, 'success', NOW())`,
        [userId, dataType]
      );

      await transaction.commit();

      return res.status(200).json({
        success: true,
        version: newVersion,
        timestamp: new Date().toISOString(),
        dataType: dataType
      });

    } catch (error) {
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('Upload error:', error);

    try {
      const { userId, dataType } = req.body;
      if (userId && dataType) {
        await query(
          `INSERT INTO sync_history (user_id, sync_type, data_types, status, error_message, sync_timestamp) 
           VALUES (?, 'upload', ?, 'failed', ?, NOW())`,
          [userId, dataType, error.message]
        );
      }
    } catch (logError) {
      console.error('Failed to log upload error history:', logError);
    }

    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};