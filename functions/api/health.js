/**
 * 健康检查接口（Cloudflare Workers 版）
 * GET /api/health
 * 用于监控服务在线状态及所在边缘节点。
 */

/**
 * 请求处理程序
 * @param {object} context - 请求上下文
 * @returns {Response} HTTP 响应
 */
export async function onRequest(context) {
  if (context.request.method === 'OPTIONS') {
    return new Response(null, { status: 204 });
  }

  if (context.request.method !== 'GET') {
    return new Response(JSON.stringify({
      success: false,
      error: 'Method not allowed'
    }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({
    success:  true,
    status:   'ok',
    platform: 'cloudflare-pages',
    version:  '1.0.0',
    time:     new Date().toISOString(),
    region:   context.request.cf?.colo || 'unknown'
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    }
  });
}
