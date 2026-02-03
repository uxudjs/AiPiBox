/**
 * Cloudflare Workers AI 代理函数
 * 代理 AI 服务请求以绕过网络限制并确保连接稳定性
 */

// 内存请求记录，用于调试
const requestQueue = new Map();

/**
 * Cloudflare Workers 请求处理入口
 * @param {Object} context Workers 上下文对象
 */
export async function onRequest(context) {
  const { request, env } = context;

  // 限制仅支持 POST 请求
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ 
      error: 'Method Not Allowed',
      message: 'This endpoint only accepts POST requests' 
    }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const startTime = Date.now();
  const requestId = request.headers.get('x-request-id') || 
                    `req_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

  try {
    const body = await request.json();
    const { url, method = 'POST', headers = {}, data, stream = false } = body;

    // 校验必填参数：目标 URL
    if (!url) {
      return new Response(JSON.stringify({ 
        error: 'Bad Request',
        message: 'Target URL is required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 记录简要请求日志
    console.log(`[${new Date().toISOString()}] [${requestId}] ${method} ${url}`);

    // 封装 Fetch 请求参数
    const fetchOptions = {
      method: method || 'POST',
      headers: {
        ...headers,
        'User-Agent': 'AiPiBox-Cloud-Proxy/2.0-Cloudflare',
        // 透传 Cloudflare 识别出的客户端真实 IP
        'X-Forwarded-For': request.headers.get('cf-connecting-ip') || 'unknown',
      },
    };

    // 非 GET 请求附带 JSON 序列化后的请求体
    if (method && method.toUpperCase() !== 'GET' && data) {
      fetchOptions.body = JSON.stringify(data);
    }

    // 场景 A: 转发 SSE 流式响应
    if (stream) {
      fetchOptions.headers['Accept'] = 'text/event-stream';

      const response = await fetch(url, fetchOptions);

      // 直接转发响应流，并配置必要的 SSE 响应头
      return new Response(response.body, {
        status: response.status,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          'Connection': 'keep-alive',
          'X-Request-ID': requestId,
        }
      });
    }

    // 场景 B: 处理常规响应
    const response = await fetch(url, fetchOptions);
    const duration = Date.now() - startTime;

    console.log(`[${requestId}] Completed: ${response.status} in ${duration}ms`);

    // 根据 Content-Type 自动解析响应体
    const contentType = response.headers.get('content-type');
    let responseData;

    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    // 注入元数据后返回标准化 JSON 响应
    return new Response(JSON.stringify({
      ...responseData,
      _meta: {
        requestId,
        duration,
        status: response.status,
        timestamp: new Date().toISOString()
      }
    }), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId
      }
    });

  } catch (error) {
    // 捕获异步请求链中的任何错误
    const duration = Date.now() - startTime;

    console.error(`[${requestId}] Error after ${duration}ms:`, error.message);

    return new Response(JSON.stringify({
      error: true,
      message: error.message,
      code: error.code || 'UNKNOWN_ERROR',
      requestId,
      duration,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
