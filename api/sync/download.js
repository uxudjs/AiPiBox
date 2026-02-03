/**
 * 同步数据下载接口
 * GET /api/sync/download
 * 负责从云端获取加密的同步数据，支持基于版本的增量同步
 */

const { query } = require('../db-config');

module.exports = async (req, res) => {
  // 限制仅支持 GET 请求
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const { userId, dataType, sinceVersion } = req.query;

    // 参数校验
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: userId'
      });
    }

    // 验证用户有效性
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

    // 动态构建查询 SQL
    let sql = 'SELECT data_type, data_content, version, checksum, updated_at FROM sync_data WHERE user_id = ?';
    const params = [userId];

    // 按需筛选特定数据类型
    if (dataType) {
      sql += ' AND data_type = ?';
      params.push(dataType);
    }

    // 实现增量同步：仅返回大于客户端当前版本号的数据
    if (sinceVersion) {
      sql += ' AND version > ?';
      params.push(parseInt(sinceVersion));
    }

    // 确保结果按版本顺序排列，以便客户端正确应用更新
    sql += ' ORDER BY version ASC';

    const results = await query(sql, params);

    // 标准化输出数据结构
    const data = results.map(row => ({
      dataType: row.data_type,
      encryptedData: row.data_content,
      version: row.version,
      checksum: row.checksum,
      timestamp: row.updated_at
    }));

    // 更新用户最后同步活动时间
    await query(
      'UPDATE users SET last_sync_at = NOW() WHERE id = ?',
      [userId]
    );

    // 记录同步操作历史
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

    // 异步记录失败日志
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
