/**
 * 云端 AI 代理 API (Serverless Function)
 * 代理 AI 服务请求以确保连接稳定性，支持 Vercel 和 Netlify 部署
 */

import axios from 'axios';

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
 * 敏感信息脱敏工具 (Headers & URLs)
 */
function maskSensitiveInfo(info, type = 'header') {
  if (type === 'header') {
    const masked = { ...info };
    const sensitiveKeys = ['authorization', 'x-api-key', 'api-key', 'cookie'];
    for (const key of Object.keys(masked)) {
      if (sensitiveKeys.includes(key.toLowerCase())) {
        const value = masked[key];
        if (typeof value === 'string' && value.length > 8) {
          masked[key] = '****' + value.slice(-4);
        }
      }
    }
    return masked;
  }
  
  if (type === 'url') {
    try {
      const urlObj = new URL(info);
      if (urlObj.searchParams.has('key')) {
        const key = urlObj.searchParams.get('key');
        urlObj.searchParams.set('key', '****' + String(key).slice(-4));
      }
      return urlObj.toString();
    } catch (e) {
      return info;
    }
  }
  return info;
}

/**
 * API 处理入口函数
 * 处理客户端发送的 AI 请求转发
 */
export default async function handler(req, res) {
  // 限制仅支持 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method Not Allowed',
      message: 'This endpoint only accepts POST requests' 
    });
  }

  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

  try {
    const { url, method = 'POST', headers = {}, data, stream = false } = req.body;

    // 1. 校验必填参数
    if (!url) {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'Target URL is required' 
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
        return res.status(403).json({ 
          error: 'Forbidden', 
          message: `Domain ${targetHost} is not in the allowlist.` 
        });
      }
    } catch (e) {
      return res.status(400).json({ error: 'Invalid target URL' });
    }

    // 3. 记录请求日志（脱敏处理）
    console.log(`[${new Date().toISOString()}] [${requestId}] ${method} ${maskSensitiveInfo(url, 'url')}`);
    console.log(`[${requestId}] Stream: ${stream}, Headers: ${JSON.stringify(maskSensitiveInfo(headers, 'header'))}`);

    // 4. 封装 Axios 请求配置
    const config = {
      url,
      method: method || 'POST',
      headers: {
        ...headers,
        'User-Agent': 'AiPiBox-Cloud-Proxy/2.0',
        'X-Forwarded-For': req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown',
      },
      timeout: stream ? 300000 : 60000,
      validateStatus: () => true,
    };

    if (method && method.toUpperCase() !== 'GET' && data) {
      config.data = data;
    }

    // 场景 A: 处理 SSE 流式响应
    if (stream) {
      config.responseType = 'stream';
      config.headers['Accept'] = 'text/event-stream';

      const response = await axios(config);

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');
      res.setHeader('X-Request-ID', requestId);

      let bytesTransferred = 0;

      response.data.on('data', (chunk) => {
        bytesTransferred += chunk.length;
        res.write(chunk);
      });

      response.data.on('end', () => {
        const duration = Date.now() - startTime;
        console.log(`[${requestId}] Stream completed: ${bytesTransferred} bytes in ${duration}ms`);
        res.end();
      });

      response.data.on('error', (err) => {
        console.error(`[${requestId}] Stream error:`, err.message);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Stream Error', message: err.message, requestId });
        } else {
          res.write(`data: ${JSON.stringify({ error: true, message: 'Stream interrupted' })}\n\n`);
          res.end();
        }
      });

      req.on('close', () => {
        response.data.destroy();
      });

      return;
    }

    // 场景 B: 处理常规 JSON 响应
    const response = await axios(config);
    const duration = Date.now() - startTime;

    console.log(`[${requestId}] Completed: ${response.status} in ${duration}ms`);

    res.status(response.status).json({
      ...response.data,
      _meta: {
        requestId,
        duration,
        status: response.status,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    const status = error.response?.status || 500;
    
    console.error(`[${requestId}] Error after ${duration}ms:`, error.message);

    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ error: true, message: 'Request interrupted', requestId })}\n\n`);
      return res.end();
    }

    res.status(status).json({
      error: true,
      message: error.response?.data?.error?.message || error.response?.data?.message || error.message,
      requestId,
      duration
    });
  }
}
