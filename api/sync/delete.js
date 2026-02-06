/**
 * 云端同步数据删除接口
 * 支持全量删除或按数据类型删除。
 */

const { query, beginTransaction } = require('../db-config');

/**
 * 删除处理程序
 * @param {object} req - HTTP 请求对象
 * @param {object} res - HTTP 响应对象
 */
module.exports = async (req, res) => {
  if (req.method !== 'DELETE') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const { userId, dataType } = req.body;

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
        error: 'User not found'
      });
    }

    const transaction = await beginTransaction();

    try {
      let deletedCount = 0;
      let deletedTypes = [];

      if (dataType) {
        const result = await transaction.query(
          'DELETE FROM sync_data WHERE user_id = ? AND data_type = ?',
          [userId, dataType]
        );
        deletedCount = result.affectedRows || 0;
        deletedTypes.push(dataType);
      } else {
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

        await transaction.query(
          'DELETE FROM users WHERE id = ?',
          [userId]
        );
      }

      await transaction.query(
        `INSERT INTO sync_history (user_id, sync_type, data_types, status, sync_timestamp) 
         VALUES (?, 'delete', ?, 'success', NOW())`,
        [userId, deletedTypes.join(',') || 'all']
      );

      await transaction.commit();

      return res.status(200).json({
        success: true,
        deletedCount: deletedCount,
        deletedTypes: deletedTypes,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('Delete error:', error);

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