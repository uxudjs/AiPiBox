/**
 * 健康检查 API 端点（Vercel/Netlify 版）
 * GET /api/health
 */

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  return res.status(200).json({
    success:   true,
    status:    'ok',
    platform:  'vercel',
    version:   '1.0.0',
    timestamp: new Date().toISOString()
  });
};
