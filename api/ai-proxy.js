/**
 * 云端 AI 代理 API (Serverless Function)
 * 代理 AI 服务请求以确保连接稳定性，支持 Vercel 和 Netlify 部署
 */

import axios from 'axios';

/**
 * 请求队列管理器
 * 用于跟踪和清理长时间挂起的请求
 */
class RequestQueue {
  constructor() {
    this.queue = new Map();
    this.processing = new Map();
  }

  /**
   * 添加请求到队列
   * @param {string} requestId 请求唯一标识
   * @param {Object} requestData 请求相关数据
   */
  add(requestId, requestData) {
    this.queue.set(requestId, {
      data: requestData,
      timestamp: Date.now(),
      status: 'queued'
    });
  }

  /**
   * 获取请求信息
   * @param {string} requestId 请求唯一标识
   */
  get(requestId) {
    return this.queue.get(requestId) || this.processing.get(requestId);
  }

  /**
   * 将请求标记为正在处理中
   * @param {string} requestId 请求唯一标识
   */
  setProcessing(requestId) {
    const data = this.queue.get(requestId);
    if (data) {
      this.queue.delete(requestId);
      this.processing.set(requestId, { ...data, status: 'processing' });
    }
  }

  /**
   * 从队列中移除已完成的请求
   * @param {string} requestId 请求唯一标识
   */
  complete(requestId) {
    this.processing.delete(requestId);
  }

  /**
   * 清理过期请求（超过 1 小时）
   */
  cleanup() {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    for (const [id, data] of this.queue.entries()) {
      if (now - data.timestamp > oneHour) {
        this.queue.delete(id);
      }
    }
    
    for (const [id, data] of this.processing.entries()) {
      if (now - data.timestamp > oneHour) {
        this.processing.delete(id);
      }
    }
  }
}

const requestQueue = new RequestQueue();

// 启动定时清理任务，每 10 分钟运行一次
if (typeof setInterval !== 'undefined') {
  setInterval(() => requestQueue.cleanup(), 10 * 60 * 1000);
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

    // 校验必填参数：目标 URL
    if (!url) {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'Target URL is required' 
      });
    }

    // 记录请求日志（已脱敏处理敏感头部）
    console.log(`[${new Date().toISOString()}] [${requestId}] ${method} ${url}`);
    console.log(`[${requestId}] Stream: ${stream}, Headers: ${JSON.stringify(maskSensitiveHeaders(headers))}`);

    // 管理请求生命周期
    requestQueue.add(requestId, { url, method, headers, data, stream });
    requestQueue.setProcessing(requestId);

    // 封装 Axios 请求配置
    const config = {
      url,
      method: method || 'POST',
      headers: {
        ...headers,
        'User-Agent': 'AiPiBox-Cloud-Proxy/2.0',
        'X-Forwarded-For': req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown',
      },
      // 流式响应设置 5 分钟超时，普通请求 1 分钟
      timeout: stream ? 300000 : 60000,
      // 允许所有 HTTP 状态码，由客户端层自行处理业务逻辑
      validateStatus: () => true,
    };

    // 非 GET 请求附带请求体数据
    if (method && method.toUpperCase() !== 'GET' && data) {
      config.data = data;
    }

    // 场景 A: 处理 SSE 流式响应
    if (stream) {
      config.responseType = 'stream';
      config.headers['Accept'] = 'text/event-stream';

      const response = await axios(config);

      // 配置 SSE 响应头
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no'); // 针对 Nginx 优化，禁用响应缓冲
      res.setHeader('X-Request-ID', requestId);

      let bytesTransferred = 0;

      // 实时转发数据块
      response.data.on('data', (chunk) => {
        bytesTransferred += chunk.length;
        res.write(chunk);
      });

      // 流结束后的清理与日志记录
      response.data.on('end', () => {
        const duration = Date.now() - startTime;
        console.log(`[${requestId}] Stream completed: ${bytesTransferred} bytes in ${duration}ms`);
        requestQueue.complete(requestId);
        res.end();
      });

      // 流异常处理
      response.data.on('error', (err) => {
        console.error(`[${requestId}] Stream error:`, err.message);
        requestQueue.complete(requestId);
        
        if (!res.headersSent) {
          res.status(500).json({
            error: 'Stream Error',
            message: err.message,
            requestId
          });
        } else {
          res.write(`data: ${JSON.stringify({ error: true, message: 'Stream interrupted' })}\n\n`);
          res.end();
        }
      });

      // 监听客户端主动断开
      req.on('close', () => {
        console.log(`[${requestId}] Client disconnected, aborting stream`);
        response.data.destroy();
        requestQueue.complete(requestId);
      });

      return;
    }

    // 场景 B: 处理常规 JSON 响应
    const response = await axios(config);
    const duration = Date.now() - startTime;

    console.log(`[${requestId}] Completed: ${response.status} in ${duration}ms`);
    requestQueue.complete(requestId);

    // 透传响应内容并附加请求元数据
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
    // 全局异常捕获
    const duration = Date.now() - startTime;
    const status = error.response?.status || 500;
    const errorData = error.response?.data;

    console.error(`[${requestId}] Error after ${duration}ms:`, {
      message: error.message,
      code: error.code,
      status: status,
      data: errorData
    });

    requestQueue.complete(requestId);

    // 处理流传输过程中的异常
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ 
        error: true, 
        message: 'Request interrupted',
        requestId 
      })}\n\n`);
      return res.end();
    }

    // 返回标准化错误结构
    res.status(status).json({
      error: true,
      message: errorData?.error?.message || errorData?.message || error.message,
      code: error.code,
      status: status,
      raw: errorData,
      requestId,
      duration,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * 脱敏处理敏感 HTTP 头部
 * @param {Object} headers 原始请求头
 * @returns {Object} 脱敏后的请求头
 */
function maskSensitiveHeaders(headers) {
  const masked = { ...headers };
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

/**
 * 部署配置说明 (Vercel / Netlify):
 * 
 * Vercel:
 * {
 *   "functions": {
 *     "api/ai-proxy.js": {
 *       "maxDuration": 300,
 *       "memory": 1024
 *     }
 *   }
 * }
 * 
 * Netlify:
 * [functions]
 *   node_bundler = "esbuild"
 * [[functions]]
 *   path = "api/ai-proxy.js"
 *   timeout = 300
 */
