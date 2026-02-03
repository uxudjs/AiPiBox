/**
 * 健康检查接口 (Cloudflare Workers / Pages Functions)
 * 用于监控服务在线状态及所在边缘节点
 */

export async function onRequest(context) {
  return new Response(JSON.stringify({
    status: 'ok',
    platform: 'cloudflare-pages',
    version: '1.0.0',
    time: new Date().toISOString(),
    region: context.request.cf?.colo || 'unknown'
  }), {
    status: 200,
    headers: { 
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    }
  });
}
