/**
 * 同步数据上传接口
 * POST /api/sync/upload
 * 接收客户端加密数据并持久化到云端，支持版本控制
 */

const { query, beginTransaction } = require('../db-config');

module.exports = async (req, res) => {
  // 限制仅支持 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const { userId, dataType, encryptedData, version, checksum } = req.body;

    // 参数校验
    if (!userId || !dataType || !encryptedData) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId, dataType, encryptedData'
      });
    }

    // 业务层：允许同步的数据类型白名单
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

    // 开启事务处理用户信息与数据同步
    const transaction = await beginTransaction();

    try {
      // 步骤 1: 维护用户信息（自动注册新用户或更新活跃状态）
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

      // 步骤 2: 更新或插入同步数据记录
      const existingData = await transaction.query(
        'SELECT id, version FROM sync_data WHERE user_id = ? AND data_type = ?',
        [userId, dataType]
      );

      const newVersion = version || Date.now();

      if (existingData.length > 0) {
        // 覆盖更新现有分类的数据内容
        await transaction.query(
          `UPDATE sync_data 
           SET data_content = ?, version = ?, checksum = ?, updated_at = NOW() 
           WHERE user_id = ? AND data_type = ?`,
          [encryptedData, newVersion, checksum, userId, dataType]
        );
      } else {
        // 首次同步该分类数据
        await transaction.query(
          `INSERT INTO sync_data (user_id, data_type, data_content, version, checksum, created_at, updated_at) 
           VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
          [userId, dataType, encryptedData, newVersion, checksum]
        );
      }

      // 步骤 3: 记录成功同步日志
      await transaction.query(
        `INSERT INTO sync_history (user_id, sync_type, data_types, status, sync_timestamp) 
         VALUES (?, 'upload', ?, 'success', NOW())`,
        [userId, dataType]
      );

      // 提交所有事务性操作
      await transaction.commit();

      return res.status(200).json({
        success: true,
        version: newVersion,
        timestamp: new Date().toISOString(),
        dataType: dataType
      });

    } catch (error) {
      // 发生异常时撤销当前事务中的所有数据库变更
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('Upload error:', error);

    // 尽力记录操作失败原因
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
