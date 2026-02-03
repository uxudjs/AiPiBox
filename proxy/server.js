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

// 确保本地存储目录存在
fs.mkdir(DATA_DIR, { recursive: true }).catch(console.error);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' })); // 增大请求限制以支持完整数据备份

/**
 * 敏感请求头脱敏工具
 * @param {Object} headers 原始请求头
 * @returns {Object} 脱敏后的请求头
 */
const maskHeaders = (headers) => {
  const masked = { ...headers };
  ['authorization', 'x-api-key', 'cookie'].forEach(h => {
    if (masked[h]) masked[h] = '********' + masked[h].slice(-4);
    if (masked[h.toLowerCase()]) masked[h.toLowerCase()] = '********' + masked[h.toLowerCase()].slice(-4);
  });
  return masked;
};

/**
 * AI API 转发端点
 * 代理 AI 请求以解决网络连接或跨域问题
 */
app.post('/api/proxy', async (req, res) => {
  const { url, method, headers, data, stream } = req.body;

  // 基础参数校验
  if (!url) return res.status(400).json({ error: 'Target URL is required' });

  // 打印脱敏日志
  console.log(`[Proxy] ${method || 'POST'} ${url}`);
  console.log(`[Headers]`, maskHeaders(headers));
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

      // 实时写入数据块
      response.data.on('data', (chunk) => {
        res.write(chunk);
      });

      response.data.on('end', () => {
        res.end();
      });

      response.data.on('error', (err) => {
        console.error('[Stream Error]', err.message);
        res.end();
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
    
    // 冲突检测逻辑占位 (当前采用客户端覆盖策略)
    try {
      await fs.readFile(filePath, 'utf8');
    } catch (e) {
      // 首次保存，文件尚不存在
    }

    // 执行写入
    await fs.writeFile(filePath, JSON.stringify({ data, timestamp }));
    
    res.json({ success: true, timestamp });
  } catch (error) {
    console.error('[Sync Post Error]', error);
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
