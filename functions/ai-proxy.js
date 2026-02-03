/**
 * Cloudflare Workers AI 代理函数
 * 代理 AI 服务请求以绕过网络限制并确保连接稳定性
 */

/**
 * 允许代理的域名白名单，防止 SSRF 攻击
 */
const ALLOWED_HOSTS = [
  'api.openai.com',
  'api.anthropic.com',
  'api.google.com',
  'generativelanguage.googleapis.com',
  'api.deepseek.com',
  'api.siliconflow.cn',
  'openrouter.ai',
  'api.mistral.ai',
  'api.groq.com',
  'api.perplexity.ai',
  'api.x.ai',
  'dashscope.aliyuncs.com',
  'open.bigmodel.cn',
  'ark.cn-beijing.volces.com',
  'api.tavily.com',
  'api.bing.microsoft.com',
  'www.googleapis.com',
  'api.replicate.com',
  'api.stability.ai'
];

/**
 * 敏感信息脱敏工具 (URLs)
 */
function maskUrl(url) {
  try {
    const urlObj = new URL(url);
    if (urlObj.searchParams.has('key')) {
      const key = urlObj.searchParams.get('key');
      urlObj.searchParams.set('key', '****' + String(key).slice(-4));
    }
    return urlObj.toString();
  } catch (e) {
    return url;
  }
}

/**
 * Cloudflare Workers 请求处理入口
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

    // 1. 校验必填参数
    if (!url) {
      return new Response(JSON.stringify({ 
        error: 'Bad Request',
        message: 'Target URL is required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 2. SSRF 安全校验：验证域名白名单
    try {
      const targetHost = new URL(url).hostname;
      const isAllowed = ALLOWED_HOSTS.some(allowed => 
        targetHost === allowed || targetHost.endsWith('.' + allowed)
      );
      
      const isAzure = targetHost.endsWith('.openai.azure.com');

      if (!isAllowed && !isAzure) {
        console.warn(`[${requestId}] [Security Alert] Blocked request to unauthorized host: ${targetHost}`);
        return new Response(JSON.stringify({ 
          error: 'Forbidden', 
          message: `Domain ${targetHost} is not in the allowlist.` 
        }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Invalid target URL' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 3. 记录日志（脱敏）
    console.log(`[${new Date().toISOString()}] [${requestId}] ${method} ${maskUrl(url)}`);

    // 4. 封装 Fetch 请求参数
    const fetchOptions = {
      method: method || 'POST',
      headers: {
        ...headers,
        'User-Agent': 'AiPiBox-Cloud-Proxy/2.0-Cloudflare',
        'X-Forwarded-For': request.headers.get('cf-connecting-ip') || 'unknown',
      },
    };

    if (method && method.toUpperCase() !== 'GET' && data) {
      fetchOptions.body = JSON.stringify(data);
    }

    // 场景 A: 转发 SSE 流式响应
    if (stream) {
      fetchOptions.headers['Accept'] = 'text/event-stream';

      const response = await fetch(url, fetchOptions);

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

    const contentType = response.headers.get('content-type');
    let responseData;

    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

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
    const duration = Date.now() - startTime;
    console.error(`[${requestId}] Error after ${duration}ms:`, error.message);

    return new Response(JSON.stringify({
      error: true,
      message: error.message,
      requestId,
      duration
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
