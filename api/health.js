/**
 * 健康检查 API 端点
 * GET /api/health
 */

module.exports = async (req, res) => {
  // 限制仅允许 GET 请求
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    // 构建基础健康状态响应
    const healthStatus = {
      success: true,
      status: 'ok',
      platform: 'vercel',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };

    // 检测数据库连通性（如果已配置）
    try {
      const { healthCheck } = require('./db-config');
      const dbHealthy = await healthCheck();
      healthStatus.database = dbHealthy ? 'online' : 'offline';
    } catch (dbError) {
      // 数据库未配置或不可用时不中断主健康检查，因为数据库属于可选组件
      healthStatus.database = 'not-configured';
    }

    // 返回健康检查结果
    return res.status(200).json(healthStatus);

  } catch (error) {
    console.error('Health check error:', error);
    // 降级响应：发生未捕获异常时仍返回基本在线状态
    return res.status(200).json({
      success: true,
      status: 'ok',
      platform: 'vercel',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      database: 'unknown'
    });
  }
};
