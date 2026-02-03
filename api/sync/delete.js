/**
 * 云端同步数据删除接口
 * DELETE /api/sync/delete
 * 支持全量删除或按数据类型删除
 */

const { query, beginTransaction } = require('../db-config');

module.exports = async (req, res) => {
  // 限制仅支持 DELETE 请求
  if (req.method !== 'DELETE') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const { userId, dataType } = req.body;

    // 参数校验
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: userId'
      });
    }

    // 确认目标用户存在
    const userExists = await query(
      'SELECT id FROM users WHERE id = ?',
      [userId]
    );

    if (userExists.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // 开启数据库事务处理删除逻辑
    const transaction = await beginTransaction();

    try {
      let deletedCount = 0;
      let deletedTypes = [];

      if (dataType) {
        // 场景 A: 仅删除特定类型的同步数据
        const result = await transaction.query(
          'DELETE FROM sync_data WHERE user_id = ? AND data_type = ?',
          [userId, dataType]
        );
        deletedCount = result.affectedRows || 0;
        deletedTypes.push(dataType);
      } else {
        // 场景 B: 全量删除该用户的所有数据（包含用户信息）
        const existingData = await transaction.query(
          'SELECT DISTINCT data_type FROM sync_data WHERE user_id = ?',
          [userId]
        );
        deletedTypes = existingData.map(row => row.data_type);

        const result = await transaction.query(
          'DELETE FROM sync_data WHERE user_id = ?',
          [userId]
        );
        deletedCount = result.affectedRows || 0;

        // 彻底移除用户记录（依赖数据库外键级联同步历史）
        await transaction.query(
          'DELETE FROM users WHERE id = ?',
          [userId]
        );
      }

      // 记录同步操作日志
      await transaction.query(
        `INSERT INTO sync_history (user_id, sync_type, data_types, status, sync_timestamp) 
         VALUES (?, 'delete', ?, 'success', NOW())`,
        [userId, deletedTypes.join(',') || 'all']
      );

      // 提交所有更改
      await transaction.commit();

      return res.status(200).json({
        success: true,
        deletedCount: deletedCount,
        deletedTypes: deletedTypes,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      // 捕获异常时回滚数据库操作
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('Delete error:', error);

    // 记录操作失败日志
    try {
      const { userId, dataType } = req.body;
      if (userId) {
        await query(
          `INSERT INTO sync_history (user_id, sync_type, data_types, status, error_message, sync_timestamp) 
           VALUES (?, 'delete', ?, 'failed', ?, NOW())`,
          [userId, dataType || 'all', error.message]
        );
      }
    } catch (logError) {
      console.error('Failed to log error history:', logError);
    }

    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
