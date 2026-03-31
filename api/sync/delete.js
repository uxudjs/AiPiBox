/**
 * 云端同步数据删除接口
 * 删除指定 syncId 对应的全部云端数据。
 */

const { query, beginTransaction } = require('../db-config');
const { verifyAuth, verifyGlobalAuth } = require('../auth');

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

  // 全局访问权限校验
  if (!verifyGlobalAuth(req, res)) {
    return;
  }

  // syncId 来自路由参数 /api/sync/:id，由 vercel.json rewrite 注入 req.query.id
  const syncId = req.query.id;

  if (!syncId) {
    return res.status(400).json({
      success: false,
      error: 'Missing required field: syncId'
    });
  }

  if (!verifyAuth(req, res, syncId)) {
    return;
  }

  try {
    const transaction = await beginTransaction();

    try {
      const result = await transaction.query(
        'DELETE FROM sync_data WHERE sync_id = ?',
        [syncId]
      );

      await transaction.commit();

      return res.status(200).json({
        success:      true,
        deletedCount: result.affectedRows || 0,
        timestamp:    new Date().toISOString()
      });

    } catch (error) {
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('Delete error:', error);
    return res.status(500).json({
      success:   false,
      error:     'An internal error occurred. Please try again later.',
      timestamp: new Date().toISOString()
    });
  }
};
