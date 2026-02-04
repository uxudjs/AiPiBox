import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import helmet from 'helmet';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');
const TASKS_DIR = path.join(DATA_DIR, 'tasks');

// 确保本地存储目录存在
fs.mkdir(DATA_DIR, { recursive: true }).catch(console.error);
fs.mkdir(TASKS_DIR, { recursive: true }).catch(console.error);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' })); // 增大请求限制以支持完整数据备份

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
const maskSensitiveInfo = (info, type = 'header') => {
  if (type === 'header') {
    const masked = { ...info };
    ['authorization', 'x-api-key', 'api-key', 'cookie'].forEach(h => {
      if (masked[h]) masked[h] = '********' + String(masked[h]).slice(-4);
      if (masked[h.toLowerCase()]) masked[h.toLowerCase()] = '********' + String(masked[h.toLowerCase()]).slice(-4);
    });
    return masked;
  }
  
  if (type === 'url') {
    try {
      const urlObj = new URL(info);
      if (urlObj.searchParams.has('key')) {
        const key = urlObj.searchParams.get('key');
        urlObj.searchParams.set('key', '********' + String(key).slice(-4));
      }
      return urlObj.toString();
    } catch (e) {
      return info;
    }
  }
  return info;
};

/**
 * AI API 转发端点
 * 代理 AI 请求以解决网络连接或跨域问题
 */
app.post('/api/proxy', async (req, res) => {
  const { url, method, headers, data, stream, taskId } = req.body;

  // 1. 基础参数校验
  if (!url) return res.status(400).json({ error: 'Target URL is required' });

  // 2. SSRF 安全校验：验证域名白名单
  try {
    const targetHost = new URL(url).hostname;
    const isAllowed = ALLOWED_HOSTS.some(allowed => 
      targetHost === allowed || targetHost.endsWith('.' + allowed)
    );
    
    // 允许用户配置的 Azure 域名 (通常包含 .openai.azure.com)
    const isAzure = targetHost.endsWith('.openai.azure.com');
    // 允许本地开发地址
    const isLocal = targetHost === 'localhost' || targetHost === '127.0.0.1';

    if (!isAllowed && !isAzure && !isLocal) {
      console.warn(`[Security Alert] Blocked proxy request to unauthorized host: ${targetHost}`);
      return res.status(403).json({ 
        error: 'Forbidden', 
        message: `Domain ${targetHost} is not in the allowlist. For security reasons, the proxy only supports recognized AI service providers.` 
      });
    }
  } catch (e) {
    return res.status(400).json({ error: 'Invalid target URL' });
  }

  // 3. 打印脱敏日志
  console.log(`[Proxy] ${method || 'POST'} ${maskSensitiveInfo(url, 'url')}`);
  console.log(`[Headers]`, maskSensitiveInfo(headers, 'header'));
  if (data) console.log(`[Data]`, typeof data === 'string' ? data.substring(0, 200) : JSON.stringify(data).substring(0, 200));

  try {
    const config = {
      url,
      method: method || 'POST',
      headers: {
        ...headers,
        'User-Agent': 'AiPiBox-Proxy/1.0',
      },
      timeout: stream ? 60000 : 30000,
    };

    // 非 GET 请求透传 body 数据
    if (method && method.toUpperCase() !== 'GET' && data) {
      config.data = data;
    }

    // 场景 A: 转发 SSE 流式响应
    if (stream) {
      config.responseType = 'stream';
      config.headers['Accept'] = 'text/event-stream';
      
      const response = await axios(config);

      // 设置流式响应头
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      let fullContent = '';
      let isCompleted = false;
      let streamBuffer = '';
      const taskFilePath = taskId ? path.join(TASKS_DIR, `${taskId}.json`) : null;

      // 如果有 taskId，预初始化任务文件
      if (taskFilePath) {
        await fs.writeFile(taskFilePath, JSON.stringify({
          status: 'generating',
          content: '',
          timestamp: Date.now()
        }));
      }

      // 实时写入数据块
      response.data.on('data', async (chunk) => {
        if (!res.writableEnded) {
          res.write(chunk);
        }
        
        if (taskId) {
          streamBuffer += chunk.toString();
          let lineIndex;
          let hasNewContent = false;
          
          while ((lineIndex = streamBuffer.indexOf('\n')) !== -1) {
            const line = streamBuffer.slice(0, lineIndex).trim();
            streamBuffer = streamBuffer.slice(lineIndex + 1);
            
            if (line.startsWith('data: ') && line !== 'data: [DONE]') {
              try {
                const json = JSON.parse(line.substring(6));
                const content = json.choices?.[0]?.delta?.content || json.choices?.[0]?.text || '';
                if (content) {
                  fullContent += content;
                  hasNewContent = true;
                }
              } catch (e) { }
            }
          }
          
          if (hasNewContent) {
            // 异步写入文件
            fs.writeFile(taskFilePath, JSON.stringify({
              status: 'generating',
              content: fullContent,
              timestamp: Date.now()
            })).catch(err => console.error('[Task Write Error]', err));
          }
        }
      });

      response.data.on('end', async () => {
        isCompleted = true;
        if (!res.writableEnded) res.end();
        
        if (taskId) {
          await fs.writeFile(taskFilePath, JSON.stringify({
            status: 'completed',
            content: fullContent,
            timestamp: Date.now()
          }));
        }
      });

      response.data.on('error', async (err) => {
        console.error('[Stream Error]', err.message);
        if (!res.writableEnded) res.end();
        
        if (taskId) {
          await fs.writeFile(taskFilePath, JSON.stringify({
            status: 'failed',
            error: err.message,
            content: fullContent,
            timestamp: Date.now()
          }));
        }
      });

      // 处理客户端提前断开的情况：代理仍继续处理直到结束
      req.on('close', () => {
        if (!isCompleted) {
          console.log(`[Proxy] Client disconnected for task ${taskId}, continuing in background...`);
        }
      });
    } else {
      // 场景 B: 处理常规 JSON 请求
      const response = await axios(config);
      console.log(`[Proxy Success] Status: ${response.status}`);
      res.json(response.data);
    }
  } catch (error) {
    const status = error.response?.status || 500;
    const errorData = error.response?.data;
    
    console.error(`[Proxy Error] ${status}:`, errorData || error.message);
    console.error('[Full Error]', {
      message: error.message,
      code: error.code,
      url: url,
      method: method || 'POST'
    });
    
    // If stream failed after headers were sent
    if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: true, message: 'Stream interrupted' })}\n\n`);
        return res.end();
    }

    res.status(status).json({
      error: true,
      message: errorData?.error?.message || errorData?.message || error.message,
      raw: errorData
    });
  }
});

/**
 * 同步接口：获取用户数据
 * 从本地文件系统读取 JSON
 */
app.get('/api/sync/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // 安全校验：防止目录遍历攻击
    if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const filePath = path.join(DATA_DIR, `${id}.json`);
    
    try {
      const data = await fs.readFile(filePath, 'utf8');
      res.json(JSON.parse(data));
    } catch (error) {
      if (error.code === 'ENOENT') {
        return res.status(404).json({ error: 'Data not found' });
      }
      throw error;
    }
  } catch (error) {
    console.error('[Sync Get Error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * 同步接口：删除用户数据
 */
app.delete('/api/sync/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    const filePath = path.join(DATA_DIR, `${id}.json`);
    try {
      await fs.unlink(filePath);
      res.json({ success: true });
    } catch (error) {
      if (error.code === 'ENOENT') {
        return res.json({ success: true, message: 'Data already gone' });
      }
      throw error;
    }
  } catch (error) {
    console.error('[Sync Delete Error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * 同步接口：保存用户数据
 * 将数据持久化到本地文件
 */
app.post('/api/sync', async (req, res) => {
  try {
    const { id, data, timestamp } = req.body;
    
    // 参数校验
    if (!id || !data || !timestamp) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 安全校验
    if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const filePath = path.join(DATA_DIR, `${id}.json`);
    
    // 执行写入
    await fs.writeFile(filePath, JSON.stringify({ data, timestamp }));
    
    res.json({ success: true, timestamp });
  } catch (error) {
    console.error('[Sync Post Error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * 获取异步任务状态
 */
app.get('/api/proxy/task/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    if (!/^[a-zA-Z0-9_-]+$/.test(taskId)) {
      return res.status(400).json({ error: 'Invalid Task ID format' });
    }

    const filePath = path.join(TASKS_DIR, `${taskId}.json`);
    try {
      const data = await fs.readFile(filePath, 'utf8');
      res.json(JSON.parse(data));
    } catch (error) {
      if (error.code === 'ENOENT') {
        return res.status(404).json({ error: 'Task not found' });
      }
      throw error;
    }
  } catch (error) {
    console.error('[Task Get Error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * 简易健康检查
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0', time: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`
  🚀 AiPiBox Proxy Server is running!
  ----------------------------------
  Endpoint: http://localhost:${PORT}/api/proxy
  Health:   http://localhost:${PORT}/api/health
  ----------------------------------
  `);
});
