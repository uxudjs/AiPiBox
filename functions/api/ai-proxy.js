/**
 * Cloudflare Workers AI 代理函数
 * 转发客户端 AI 服务请求，提供安全校验、日志记录、SSE 流式响应透传及 SSRF 防护。
 */

import { verifyGlobalAuth } from './auth.js';

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
  'dashscope-intl.aliyuncs.com',
  'dashscope.us-west-1.aliyuncs.com',
  'open.bigmodel.cn',
  'ark.cn-beijing.volces.com',
  'api.tavily.com',
  'api.bing.microsoft.com',
  'www.googleapis.com',
  'api.replicate.com',
  'api.stability.ai'
];

/**
 * 内存速率限制器
 * 以客户端真实 IP 为键，记录时间窗口内的请求次数。
 * 注意：此实现为单实例内存存储，适用于单 Worker 隔离区场景。
 *       Cloudflare Workers 的不同边缘节点实例间不共享内存，
 *       如需全局限流，应使用 Cloudflare KV 或 Durable Objects。
 *
 * @type {Map<string, { count: number, windowStart: number }>}
 */
const rateLimitStore = new Map();

/**
 * 速率限制配置
 */
const RATE_LIMIT = {
  /** 时间窗口时长（毫秒） */
  windowMs: 60 * 1000,
  /** 单窗口内允许的最大请求数，可通过环境变量覆盖 */
  maxRequests: 60
};

/**
 * 检查并更新请求速率限制。
 * 过期条目在此函数内随机清理，避免内存无限增长。
 * @param {string} ip          - 客户端 IP 地址
 * @param {number} maxRequests - 本次生效的最大请求数
 * @returns {{ allowed: boolean, remaining: number, resetAt: number }}
 */
function checkRateLimit(ip, maxRequests) {
  const now = Date.now();

  // 以低概率（约 5%）顺带清理全部过期条目，防止内存增长
  if (Math.random() < 0.05) {
    for (const [key, record] of rateLimitStore.entries()) {
      if (now - record.windowStart >= RATE_LIMIT.windowMs) {
        rateLimitStore.delete(key);
      }
    }
  }

  const record = rateLimitStore.get(ip);

  if (!record || now - record.windowStart >= RATE_LIMIT.windowMs) {
    rateLimitStore.set(ip, { count: 1, windowStart: now });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + RATE_LIMIT.windowMs };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: record.windowStart + RATE_LIMIT.windowMs };
  }

  record.count += 1;
  return { allowed: true, remaining: maxRequests - record.count, resetAt: record.windowStart + RATE_LIMIT.windowMs };
}

/**
 * 获取客户端真实 IP 地址。
 * 优先读取 Cloudflare 注入的 cf-connecting-ip（客户端无法伪造）。
 * @param {Request} request - Cloudflare Workers Request 对象
 * @returns {string}
 */
function getClientIp(request) {
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

/**
 * 敏感信息脱敏处理器
 * 对日志输出中的 URL query 参数中的 key 进行屏蔽处理。
 * @param {string} url - 待脱敏的 URL
 * @returns {string} 脱敏后的 URL
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
 * 构造 JSON 响应
 * @param {object} body           - 响应体对象
 * @param {number} status         - HTTP 状态码
 * @param {object} [extraHeaders] - 额外响应头
 * @returns {Response}
 */
function jsonResponse(body, status, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders }
  });
}

/**
 * Cloudflare Workers 请求处理入口
 * @param {object} context - 请求上下文
 * @returns {Promise<Response>}
 */
export async function onRequest(context) {
  const { request, env } = context;

  // 全局访问权限校验
  const auth = await verifyGlobalAuth(request, env);
  if (!auth.ok) {
    return auth.response;
  }

  if (request.method !== 'POST') {
    return jsonResponse({
      error:   'Method Not Allowed',
      message: 'This endpoint only accepts POST requests'
    }, 405);
  }

  const startTime   = Date.now();
  const requestId   = request.headers.get('x-request-id') ||
                      `req_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  const clientIp    = getClientIp(request);
  const maxRequests = parseInt(env.PROXY_RATE_LIMIT || String(RATE_LIMIT.maxRequests), 10);

  // 速率限制检查
  const rateResult = checkRateLimit(clientIp, maxRequests);
  const rateLimitHeaders = {
    'X-RateLimit-Limit':     String(maxRequests),
    'X-RateLimit-Remaining': String(rateResult.remaining),
    'X-RateLimit-Reset':     String(Math.ceil(rateResult.resetAt / 1000))
  };

  if (!rateResult.allowed) {
    console.warn(`[${requestId}] [RateLimit] Blocked IP: ${clientIp}`);
    return jsonResponse({
      error:      'Too Many Requests',
      message:    'Rate limit exceeded. Please slow down your requests.',
      retryAfter: Math.ceil((rateResult.resetAt - Date.now()) / 1000)
    }, 429, rateLimitHeaders);
  }

  try {
    const body = await request.json();
    const { url, method = 'POST', headers = {}, data, stream = false } = body;

    if (!url) {
      return jsonResponse({
        error:   'Bad Request',
        message: 'Target URL is required'
      }, 400, rateLimitHeaders);
    }

    try {
      const targetHost = new URL(url).hostname;
      const isAllowed  = ALLOWED_HOSTS.some(allowed =>
        targetHost === allowed || targetHost.endsWith('.' + allowed)
      );

      const isAzure = targetHost.endsWith('.openai.azure.com');

      if (!isAllowed && !isAzure) {
        console.warn(`[${requestId}] [Security Alert] Blocked request to unauthorized host: ${targetHost}`);
        return jsonResponse({
          error:   'Forbidden',
          message: `Domain ${targetHost} is not in the allowlist.`
        }, 403, rateLimitHeaders);
      }
    } catch (e) {
      return jsonResponse({ error: 'Invalid target URL' }, 400, rateLimitHeaders);
    }

    console.log(`[${new Date().toISOString()}] [${requestId}] ${method} ${maskUrl(url)}`);

    const fetchOptions = {
      method: method || 'POST',
      headers: {
        ...headers,
        'User-Agent':      'AiPiBox-Cloud-Proxy/2.0-Cloudflare',
        'X-Forwarded-For': clientIp
      }
    };

    if (method && method.toUpperCase() !== 'GET' && data) {
      fetchOptions.body = JSON.stringify(data);
    }

    if (stream) {
      fetchOptions.headers['Accept'] = 'text/event-stream';

      const response = await fetch(url, fetchOptions);

      return new Response(response.body, {
        status: response.status,
        headers: {
          ...rateLimitHeaders,
          'Content-Type':  'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          'Connection':    'keep-alive',
          'X-Request-ID':  requestId
        }
      });
    }

    const response = await fetch(url, fetchOptions);
    const duration  = Date.now() - startTime;

    console.log(`[${requestId}] Completed: ${response.status} in ${duration}ms`);

    const contentType = response.headers.get('content-type');
    const meta = {
      requestId,
      duration,
      status:    response.status,
      timestamp: new Date().toISOString()
    };

    let responseBody;

    if (contentType && contentType.includes('application/json')) {
      // JSON 响应：展开后附加 _meta
      const responseData = await response.json();
      responseBody = { ...responseData, _meta: meta };
    } else {
      // 非 JSON 响应（纯文本、HTML 等）：原文保留在 body 字段，避免展开丢失内容
      const responseData = await response.text();
      responseBody = { body: responseData, _meta: meta };
    }

    return new Response(JSON.stringify(responseBody), {
      status: response.status,
      headers: {
        ...rateLimitHeaders,
        'Content-Type': 'application/json',
        'X-Request-ID': requestId
      }
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[${requestId}] Error after ${duration}ms:`, error.message);

    return jsonResponse({
      error:     true,
      message:   'An error occurred while processing the request.',
      requestId,
      duration
    }, 500, rateLimitHeaders);
  }
}
