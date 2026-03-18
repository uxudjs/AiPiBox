/**
 * 同步数据下载接口
 * 负责从云端获取加密的同步数据。
 */

const { query }      = require('../db-config');
const { verifyAuth } = require('../auth');

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
    const results = await query(
      'SELECT data_content, updated_at FROM sync_data WHERE sync_id = ? LIMIT 1',
      [syncId]
    );

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No sync data found'
      });
    }

    const row = results[0];

    return res.status(200).json({
      success:   true,
      data:      row.data_content,
      timestamp: row.updated_at
    });

  } catch (error) {
    console.error('Download error:', error);
    return res.status(500).json({
      success:   false,
      error:     'An internal error occurred. Please try again later.',
      timestamp: new Date().toISOString()
    });
  }
};
