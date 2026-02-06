/**
 * 健康检查接口
 * 用于监控服务在线状态及所在边缘节点，支持跨域访问。
 */

/**
 * 请求处理程序
 * @param {object} context - 请求上下文
 * @returns {Response} HTTP 响应
 */
export async function onRequest(context) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,HEAD,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  return new Response(JSON.stringify({
    status: 'ok',
    platform: 'cloudflare-pages',
    version: '1.0.0',
    time: new Date().toISOString(),
    region: context.request.cf?.colo || 'unknown'
  }), {
    status: 200,
    headers: { 
      ...corsHeaders,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    }
  });
}