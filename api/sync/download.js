/**
 * 同步数据下载接口
 * 负责从云端获取加密的同步数据，支持基于版本的增量同步。
 */

const { query } = require('../db-config');

/**
 * 下载处理程序
 * @param {object} req - HTTP 请求对象
 * @param {object} res - HTTP 响应对象
 */
module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const { userId, dataType, sinceVersion } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: userId'
      });
    }

    const userExists = await query(
      'SELECT id FROM users WHERE id = ?',
      [userId]
    );

    if (userExists.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        data: []
      });
    }

    let sql = 'SELECT data_type, data_content, version, checksum, updated_at FROM sync_data WHERE user_id = ?';
    const params = [userId];

    if (dataType) {
      sql += ' AND data_type = ?';
      params.push(dataType);
    }

    if (sinceVersion) {
      sql += ' AND version > ?';
      params.push(parseInt(sinceVersion));
    }

    sql += ' ORDER BY version ASC';

    const results = await query(sql, params);

    const data = results.map(row => ({
      dataType: row.data_type,
      encryptedData: row.data_content,
      version: row.version,
      checksum: row.checksum,
      timestamp: row.updated_at
    }));

    await query(
      'UPDATE users SET last_sync_at = NOW() WHERE id = ?',
      [userId]
    );

    const dataTypes = dataType || data.map(d => d.dataType).join(',');
    await query(
      `INSERT INTO sync_history (user_id, sync_type, data_types, status, sync_timestamp) 
       VALUES (?, 'download', ?, 'success', NOW())`,
      [userId, dataTypes]
    );

    return res.status(200).json({
      success: true,
      data: data,
      count: data.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Download error:', error);

    try {
      const { userId, dataType } = req.query;
      if (userId) {
        await query(
          `INSERT INTO sync_history (user_id, sync_type, data_types, status, error_message, sync_timestamp) 
           VALUES (?, 'download', ?, 'failed', ?, NOW())`,
          [userId, dataType || 'all', error.message]
        );
      }
    } catch (logError) {
      console.error('Failed to log sync error history:', logError);
    }

    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};