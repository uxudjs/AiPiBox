/**
 * AI 服务集成模块
 * 负责处理多厂商 AI 模型（OpenAI, Anthropic, Google, DeepSeek 等）的对话、生图、搜索及模型列表获取。
 * 提供流式响应解析、思考过程捕获、自动重试、代理转发及对话压缩等核心能力。
 */

import axios from 'axios';
import { logger } from './logger';
import { inferModelDisplayName, inferModelCapabilities } from '../utils/modelNameInference';
import { withCache } from '../utils/requestCache';
import { getProxyApiUrl, detectPlatform } from '../utils/envDetect';
import { useTranslation } from '../i18n';
import { getAliyunRegionUrl } from '../store/useConfigStore';

/**
 * AI 服务提供商标识符常量
 */
export const AI_PROVIDERS = {
  OPENAI: 'openai',
  ANTHROPIC: 'anthropic',
  GOOGLE: 'google',
  OLLAMA: 'ollama',
  DEEPSEEK: 'deepseek',
  SILICONFLOW: 'siliconflow',
  OPENROUTER: 'openrouter',
  MISTRAL: 'mistral',
  GROQ: 'groq',
  PERPLEXITY: 'perplexity',
  XAI: 'xai',
  ALIYUN: 'aliyun',
  CHATGLM: 'chatglm',
  VOLCENGINE: 'volcengine',
  AZURE: 'azure',
  LMSTUDIO: 'lmstudio'
};

/**
 * 自动请求重试包装器
 * @param {Function} fn - 待执行的异步函数
 * @param {number} retries - 剩余重试次数
 * @param {number} delay - 重试延迟毫秒数
 * @returns {Promise<any>} 函数执行结果
 */
async function withRetry(fn, retries = 3, delay = 1000) {
  try {
    return await fn();
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    
    let status = error.response?.status;
    if (!status && error.message) {
      const match = error.message.match(/HTTP Error (\d+)/);
      if (match) status = parseInt(match[1], 10);
    }
    
    if (status) {
      if (status >= 400 && status < 500 && status !== 429) {
        logger.warn('aiService', `Client error (${status}), no retry:`, error.message);
        throw error;
      }
    }
    
    if (error.noRetry) {
      logger.warn('aiService', `Error marked as non-retryable:`, error.message);
      throw error;
    }
    
    if (retries <= 0) {
      logger.error('aiService', `Retry limit reached, request failed:`, error.message);
      throw error;
    }
    
    // 处理 429 限流后的 Retry-After 标头
    let nextDelay = delay;
    if (status === 429) {
      const retryAfter = error.response?.headers?.['retry-after'];
      if (retryAfter) {
        const seconds = parseInt(retryAfter, 10);
        if (!isNaN(seconds)) {
          nextDelay = seconds * 1000;
        } else {
          const date = new Date(retryAfter).getTime();
          if (!isNaN(date)) {
            nextDelay = Math.max(0, date - Date.now());
          }
        }
        logger.info('aiService', `Rate limited (429), following Retry-After: ${nextDelay}ms`);
      }
    }

    logger.info('aiService', `Request failed, will retry after ${nextDelay}ms (${retries} retries remaining)... Error: ${error.message}`);
    await new Promise(resolve => setTimeout(resolve, nextDelay));
    return withRetry(fn, retries - 1, status === 429 ? delay : delay * 2);
  }
}

/**
 * 规范化 API 基础地址
 * @param {string} url - 原始 URL
 * @returns {string} 处理后的 URL
 */
const normalizeBaseUrl = (url) => {
  return (url || '').trim().replace(/\/+$/, '');
};

/**
 * 验证连接安全性
 * @param {string} url - 待验证的 URL
 */
const checkSecureConnection = (url) => {
  if (url && url.startsWith('http:') && !url.includes('localhost') && !url.includes('127.0.0.1') && !url.includes('0.0.0.0')) {
    logger.warn('aiService', 'Security Warning: Using insecure HTTP connection to remote server:', url);
  }
};

/**
 * 构建具体的 API 请求 URL
 * @param {string} baseUrl - 基础地址
 * @param {string} endpoint - 终端路径
 * @param {string} format - API 格式
 * @param {string} provider - 服务商标识
 * @returns {string} 完整请求路径
 */
const buildTargetUrl = (baseUrl, endpoint, format, provider) => {
  let url = normalizeBaseUrl(baseUrl);
  checkSecureConnection(url);
  
  if (provider === 'azure' || url.includes('openai.azure.com')) {
    if (url.includes('/chat/completions') || url.includes('/models')) {
      return url;
    }
    return url; 
  }

  if (format === 'gemini' || format === 'google') {
    if (!url.includes('/v1beta') && !url.includes('/v1')) {
      url += '/v1beta';
    }
    return `${url}${endpoint}`;
  }
  
  if (format === 'claude') {
    if (!url.includes('/v1')) {
      url += '/v1';
    }
    return `${url}${endpoint}`;
  }
  
  if (url.includes('/chat/completions')) {
    if (endpoint === '/models') {
       return url.replace('/chat/completions', '/models');
    }
    return url;
  }
  
  const lastPart = url.split('?')[0].split('/').pop();
  const hasVersion = /^v\d+/.test(lastPart) || lastPart === 'beta' || url.includes('/v1/');
  
  if (hasVersion) {
    return `${url}${endpoint}`;
  }

  if (url.includes('api.perplexity.ai')) {
    return `${url}${endpoint}`;
  }

  return `${url}/v1${endpoint}`;
};

/**
 * 请求 Payload 转换器集合
 */
const formatters = {
  [AI_PROVIDERS.OPENAI]: (messages, model, options) => {
    const { max_thinking_tokens, ...rest } = options;
    const filteredOptions = Object.entries(rest).reduce((acc, [key, value]) => {
      if (value !== null && value !== undefined) acc[key] = value;
      return acc;
    }, {});

    const payload = { model, messages, ...filteredOptions };
    
    const lowerModel = String(model).toLowerCase();
    if ((lowerModel.includes('o1') || lowerModel.includes('o3')) && payload.max_tokens) {
      payload.max_completion_tokens = payload.max_tokens;
      delete payload.max_tokens;
    }
    
    return payload;
  },
  [AI_PROVIDERS.ANTHROPIC]: (messages, model, options) => {
    const systemMessage = messages.find(m => m.role === 'system');
    const userAssistantMessages = messages.filter(m => m.role !== 'system');
    
    const { max_thinking_tokens, ...rest } = options;
    const payload = {
      model,
      system: systemMessage?.content,
      messages: userAssistantMessages.map(m => {
        let content = m.content;
        if (Array.isArray(content)) {
          content = content.map(item => {
            if (item.type === 'image_url') {
              const matches = item.image_url.url.match(/^data:([^;]+);base64,(.+)$/);
              if (matches) {
                return {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: matches[1],
                    data: matches[2]
                  }
                };
              }
            }
            return item;
          });
        }
        return {
          role: m.role === 'user' ? 'user' : 'assistant',
          content: content
        };
      }),
      max_tokens: rest.max_tokens || 4096,
      ...rest
    };
    
    if (max_thinking_tokens) {
      payload.thinking = { type: 'enabled', budget_tokens: max_thinking_tokens };
      if (payload.max_tokens <= max_thinking_tokens) {
        payload.max_tokens = max_thinking_tokens + 2048;
      }
    }
    return payload;
  },
  [AI_PROVIDERS.GOOGLE]: (messages, model, options) => {
    const systemMessage = messages.find(m => m.role === 'system');
    const userModelMessages = messages.filter(m => m.role !== 'system');
    
    const filteredContents = [];
    userModelMessages.forEach((m) => {
      const role = m.role === 'user' ? 'user' : 'model';
      let parts = [];
      if (Array.isArray(m.content)) {
        parts = m.content.map(item => {
          if (item.type === 'text') return { text: item.text };
          if (item.type === 'image_url') {
            const matches = item.image_url.url.match(/^data:([^;]+);base64,(.+)$/);
            if (matches) {
              return {
                inline_data: { mime_type: matches[1], data: matches[2] }
              };
            }
          }
          return null;
        }).filter(Boolean);
      } else {
        parts = [{ text: m.content }];
      }
      
      if (filteredContents.length > 0 && filteredContents[filteredContents.length - 1].role === role) {
        const lastContent = filteredContents[filteredContents.length - 1];
        lastContent.parts = [...lastContent.parts, ...parts];
      } else {
        filteredContents.push({ role, parts });
      }
    });

    if (filteredContents.length > 0 && filteredContents[0].role === 'model') {
      filteredContents.unshift({ role: 'user', parts: [{ text: 'Continue' }] });
    }

    return {
      contents: filteredContents,
      system_instruction: systemMessage ? { parts: [{ text: systemMessage.content }] } : undefined,
      generationConfig: {
        maxOutputTokens: options.max_tokens,
        temperature: options.temperature,
        topP: options.top_p,
        topK: options.top_k,
        stopSequences: options.stop,
        candidateCount: options.n
      }
    };
  }
};

formatters.claude = formatters[AI_PROVIDERS.ANTHROPIC];
formatters.gemini = formatters[AI_PROVIDERS.GOOGLE];
formatters.google = formatters[AI_PROVIDERS.GOOGLE];
formatters.openai = formatters[AI_PROVIDERS.OPENAI];
formatters.azure = formatters[AI_PROVIDERS.OPENAI];

/**
 * 流式响应解析器集合
 */
const parsers = {
  [AI_PROVIDERS.OPENAI]: (line) => {
    if (!line.startsWith('data: ')) return null;
    const jsonStr = line.replace('data: ', '').trim();
    if (jsonStr === '[DONE]') return { done: true };
    try {
      const json = JSON.parse(jsonStr);
      const delta = json.choices[0]?.delta || {};
      const content = delta.content || '';
      const reasoning = delta.reasoning_content || delta.thinking || '';
      if (!content && !reasoning) return null;
      return { content, reasoning };
    } catch (e) { return null; }
  },
  [AI_PROVIDERS.ANTHROPIC]: (line) => {
    try {
      const json = JSON.parse(line);
      if (json.type === 'content_block_delta') {
        if (json.delta?.type === 'text_delta') return { content: json.delta?.text || '' };
        if (json.delta?.type === 'thinking_delta') return { reasoning: json.delta?.thinking || '' };
      }
      if (json.type === 'message_stop') return { done: true };
    } catch (e) {}
    return null;
  },
  [AI_PROVIDERS.GOOGLE]: (line) => {
    let clean = line;
    if (clean.startsWith('data:')) clean = clean.substring(5).trim();
    if (clean.startsWith(',')) clean = clean.substring(1).trim();
    if (clean.startsWith('[') || clean.startsWith(']')) return null;
    if (!clean) return null;
    try {
      const json = JSON.parse(clean);
      const parts = json.candidates?.[0]?.content?.parts || [];
      let content = '';
      let reasoning = '';

      parts.forEach((part) => {
        if (part.thought === true || part.thought || part.reasoning_content || part.thought_process) {
          reasoning += part.text || part.reasoning_content || part.thought_process || '';
        } else if (part.text) {
          content += part.text;
        }
      });

      if (!content && !reasoning) return null;
      return { content, reasoning };
    } catch (e) { return null; }
  }
};

parsers.claude = parsers[AI_PROVIDERS.ANTHROPIC];
parsers.gemini = parsers[AI_PROVIDERS.GOOGLE];
parsers.google = parsers[AI_PROVIDERS.GOOGLE];
parsers.openai = parsers[AI_PROVIDERS.OPENAI];
parsers.azure = parsers[AI_PROVIDERS.OPENAI];

/**
 * 获取当前生效的代理服务器地址
 * @param {object} proxyConfig - 代理配置对象
 * @returns {string} 代理 URL
 */
function getProxyUrl(proxyConfig = {}) {
  if (proxyConfig.cloudUrl) {
    return proxyConfig.cloudUrl;
  }
  
  try {
    const autoUrl = getProxyApiUrl();
    logger.debug('aiService', 'Auto-detected proxy URL:', autoUrl);
    return autoUrl;
  } catch (error) {
    logger.warn('aiService', 'Failed to auto-detect proxy URL, using fallback');
    return proxyConfig.url || '/api/proxy';
  }
}

/**
 * 测试 API 连接性
 * @param {string} provider - 服务商
 * @param {string} apiKey - 密钥
 * @param {string} baseUrl - 基础地址
 * @param {object} proxyConfig - 代理配置
 * @param {string} format - 接口格式
 * @returns {Promise<boolean>} 是否连接成功
 */
export async function testConnection(provider, apiKey, baseUrl, proxyConfig = {}, format = 'openai') {
  const isProxy = proxyConfig.enabled === true;
  const proxyUrl = isProxy ? getProxyUrl(proxyConfig) : null;
  
  let targetUrl;
  let headers = { 'Content-Type': 'application/json' };
  let method = 'GET';
  let data = null;

  if (format === 'gemini') {
    targetUrl = buildTargetUrl(baseUrl, '/models', format, provider) + `?key=${apiKey}`;
  } else if (format === 'claude') {
    targetUrl = buildTargetUrl(baseUrl, '/messages', format, provider);
    method = 'POST';
    data = { 
      model: 'claude-3-haiku-20240307', 
      max_tokens: 1, 
      messages: [{role:'user', content:'hi'}] 
    };
    headers['x-api-key'] = apiKey;
    headers['anthropic-version'] = '2023-06-01';
    headers['anthropic-dangerous-direct-browser-access'] = 'true';
  } else if (provider === 'azure' || (baseUrl && baseUrl.includes('openai.azure.com'))) {
    if (baseUrl && baseUrl.includes('/chat/completions')) {
      targetUrl = baseUrl;
    } else {
       targetUrl = baseUrl;
    }
    method = 'POST';
    data = { messages: [{role:'user', content:'hi'}], max_tokens: 1 };
    headers['api-key'] = apiKey;
  } else {
    targetUrl = buildTargetUrl(baseUrl, '/models', format, provider);
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  logger.debug('aiService', 'Testing connection to:', targetUrl, { useProxy: isProxy });

  try {
    if (isProxy && proxyUrl) {
      const res = await axios.post(proxyUrl, { 
        url: targetUrl, 
        method,
        headers,
        data
      }, { 
        headers: { 'Content-Type': 'application/json' },
        timeout: (proxyConfig.timeout || 30) * 1000 
      });
      return res.status === 200;
    }

    if (method === 'POST') {
      const res = await axios.post(targetUrl, data, { headers });
      return res.status === 200;
    }

    const response = await axios.get(targetUrl, { headers });
    return response.status === 200;
  } catch (error) {
    logger.error('aiService', 'Test connection failed:', error);
    let detail = error.response?.data?.error?.message || error.message;
    
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
      if (isProxy) {
        detail = 'Unable to connect to cloud proxy server. Please check if the application is properly deployed and the proxy API is accessible.';
      } else {
        detail = 'Network connection failed. This may be due to CORS restrictions. Consider enabling proxy mode.';
      }
    }

    throw new Error(`Connection test failed: ${detail}`);
  }
}

/**
 * 获取可用的模型列表
 * @param {string} provider - 服务商
 * @param {string} apiKey - 密钥
 * @param {string} baseUrl - 基础地址
 * @param {object} proxyConfig - 代理配置
 * @param {string} format - 接口格式
 * @returns {Promise<Array>} 模型对象列表
 */
export async function fetchModels(provider, apiKey, baseUrl, proxyConfig = {}, format = 'openai') {
  if (provider === 'azure') {
    return []; 
  }

  const isProxy = proxyConfig.enabled === true;
  const proxyUrl = isProxy ? getProxyUrl(proxyConfig) : null;

  let targetUrl;
  const headers = { 'Content-Type': 'application/json' };

  if (format === 'gemini') {
    targetUrl = buildTargetUrl(baseUrl, '/models', format, provider) + `?key=${apiKey}`;
  } else {
    targetUrl = buildTargetUrl(baseUrl, '/models', format, provider);
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  logger.debug('aiService', 'Fetching models from:', targetUrl, { useProxy: isProxy });

  return withCache(
    { url: targetUrl, method: 'GET', headers },
    async () => {
      try {
        let response;
        if (isProxy && proxyUrl) {
          response = await axios.post(proxyUrl, { 
            url: targetUrl, 
            method: 'GET', 
            headers: headers 
          }, { 
            headers: { 'Content-Type': 'application/json' },
            timeout: (proxyConfig.timeout || 30) * 1000 
          });
        } else {
          response = await axios.get(targetUrl, { headers });
        }

    if (format === 'gemini') {
      const geminiModels = response.data?.models || [];
      if (!Array.isArray(geminiModels)) return [];
          
      return geminiModels.map(m => {
        const id = String(m.name || '').split('/').pop() || 'unknown';
        let displayName = m.displayName || m.display_name || m.displayname;
        
        if (!displayName) {
          const inferredName = inferModelDisplayName(id, provider);
          displayName = inferredName || id;
        }
        
        const inferredCapabilities = inferModelCapabilities(id);
            
        return {
          id: id,
          name: displayName,
          selected: false,
          customId: '',
          capabilities: {
            tools: Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent'),
            thinking: inferredCapabilities.thinking,
            multimodal: inferredCapabilities.multimodal || (m.inputTokenLimit || 0) > 0
          }
        };
      });
    }

    const models = response.data.data || response.data;
    if (!Array.isArray(models)) return [];

        return models.map(m => {
          const id = m.id || m.name;
          let displayName = m.displayName || m.display_name || m.displayname || m.display;
          
          if (!displayName) {
            const inferredName = inferModelDisplayName(id, provider);
            displayName = inferredName || id;
          }
          
          const capabilities = inferModelCapabilities(id);
          
          return {
            id: id,
            name: displayName,
            selected: false,
            customId: '',
            capabilities: capabilities
          };
        });
      } catch (error) {
        logger.error('aiService', 'Fetch models failed:', error);
        
        if (error.message === 'Network Error' || error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
          if (isProxy) {
            const detail = 'Unable to connect to cloud proxy server. Please check if the application is properly deployed and the proxy API is accessible.';
            throw new Error(`Failed to fetch model list: ${detail}`);
          } else {
            const detail = 'Network connection failed. This may be due to CORS restrictions. Consider enabling proxy mode.';
            throw new Error(`Failed to fetch model list: ${detail}`);
          }
        }

        throw error;
      }
    }
  );
}

/**
 * 执行联网搜索
 * @param {string} query - 搜索关键词
 * @param {string} engine - 搜索引擎 (bing, google, tavily)
 * @param {string} apiKey - 引擎 API 密钥
 * @returns {Promise<Array>} 搜索结果列表
 */
export async function search(query, engine, apiKey) {
  logger.info('aiService', 'Starting search:', { query, engine });
  
  const { t } = useTranslation();
  
  if (!query || !query.trim()) throw new Error(t('services.search.queryEmpty'));

  try {
    if (engine === 'tavily') {
      if (!apiKey) throw new Error('Tavily 需要 API 密钥。');
      const res = await axios.post('https://api.tavily.com/search', {
        api_key: apiKey,
        query: query.trim(),
        search_depth: 'basic',
        max_results: 5,
        include_answer: false,
        include_raw_content: false
      }, { timeout: 10000 });
      return res.data.results?.map(r => ({
        title: r.title || t('services.search.untitled'),
        url: r.url || '',
        snippet: r.content || r.snippet || t('services.search.noSnippet')
      })) || [];
    } else if (engine === 'bing') {
      if (!apiKey) throw new Error('Bing Search 需要 API 密钥。');
      const res = await axios.get(`https://api.bing.microsoft.com/v7.0/search`, {
        params: { q: query.trim(), count: 5, mkt: 'zh-CN' },
        headers: { 'Ocp-Apim-Subscription-Key': apiKey },
        timeout: 10000
      });
      return res.data.webPages?.value?.map(r => ({
        title: r.name || t('services.search.untitled'),
        url: r.url || '',
        snippet: r.snippet || r.description || t('services.search.noSnippet')
      })) || [];
    } else if (engine === 'google') {
      if (!apiKey) throw new Error('Google Custom Search 需要 API 密钥。');
      const [key, cx] = apiKey.split('|');
      if (!cx) throw new Error('Google 搜索需要 API_KEY|CX 格式的密钥。');
      const res = await axios.get('https://www.googleapis.com/customsearch/v1', {
        params: { key: key.trim(), cx: cx.trim(), q: query.trim(), num: 5 },
        timeout: 10000
      });
      return res.data.items?.map(r => ({
        title: r.title || t('services.search.untitled'),
        url: r.link || '',
        snippet: r.snippet || r.htmlSnippet?.replace(/<[^>]*>/g, '') || t('services.search.noSnippet')
      })) || [];
    }
    throw new Error(t('services.search.unsupportedEngine', { engine }));
  } catch (error) {
    logger.error('aiService', 'Search failed:', error);
    throw new Error(`Search failed: ${error.message}`);
  }
}

/**
 * AI 对话补全接口
 * @param {object} params - 配置参数，包含 provider, model, messages, apiKey 等
 * @returns {Promise<string|void>} 非流式返回结果，流式则通过回调返回
 */
export async function chatCompletion({
  provider,
  model,
  messages,
  apiKey,
  baseUrl,
  options = {},
  proxyConfig = {},
  onStream = null,
  onThinking = null,
  onThinkingEnd = null,
  format = 'openai',
  signal = null,
  taskId = null
}) {
  let thinkingBuffer = '';
  let isThinkingState = false;
  let thinkingTagName = null;
  let hasNativeReasoning = false;
  let isReasoningEnded = false;

  /**
   * 处理流式响应并解析思考过程标签
   */
  const handleStream = (chunk) => {
    if (!onStream) return;
    if (!onThinking) {
      onStream(chunk);
      return;
    }

    thinkingBuffer += chunk;
    while (true) {
      if (!isThinkingState) {
        const match = thinkingBuffer.match(/<(think|thinking)>/);
        if (match) {
          const startIndex = match.index;
          const tag = match[0];
          thinkingTagName = match[1];
          if (startIndex > 0) onStream(thinkingBuffer.substring(0, startIndex));
          isThinkingState = true;
          thinkingBuffer = thinkingBuffer.substring(startIndex + tag.length);
        } else {
          const MAX_TAG_LEN = 10;
          let safeToFlushIndex = thinkingBuffer.length;
          const lastLT = thinkingBuffer.lastIndexOf('<');
          if (lastLT !== -1 && thinkingBuffer.length - lastLT < MAX_TAG_LEN) safeToFlushIndex = lastLT;
          if (safeToFlushIndex > 0) {
            onStream(thinkingBuffer.substring(0, safeToFlushIndex));
            thinkingBuffer = thinkingBuffer.substring(safeToFlushIndex);
          }
          break;
        }
      } else {
        const closeTag = `</${thinkingTagName}>`;
        const closeIndex = thinkingBuffer.indexOf(closeTag);
        if (closeIndex !== -1) {
          const thinkingContent = thinkingBuffer.substring(0, closeIndex);
          if (thinkingContent) onThinking(thinkingContent);
          isThinkingState = false;
          thinkingBuffer = thinkingBuffer.substring(closeIndex + closeTag.length);
          thinkingTagName = null;
          if (onThinkingEnd && !isReasoningEnded) {
            onThinkingEnd();
            isReasoningEnded = true;
          }
        } else {
          const MAX_CLOSE_TAG_LEN = 20;
          let safeToFlushIndex = thinkingBuffer.length;
          const lastLT = thinkingBuffer.lastIndexOf('<');
          if (lastLT !== -1 && thinkingBuffer.length - lastLT < MAX_CLOSE_TAG_LEN) safeToFlushIndex = lastLT;
          if (safeToFlushIndex > 0) {
            const contentToFlush = thinkingBuffer.substring(0, safeToFlushIndex);
            if (contentToFlush) onThinking(contentToFlush);
            thinkingBuffer = thinkingBuffer.substring(safeToFlushIndex);
          }
          break;
        }
      }
    }
  };

  /**
   * 清空当前的思考缓冲区
   */
  const flushThinkingBuffer = () => {
    if (thinkingBuffer) {
      if (isThinkingState && onThinking) {
        onThinking(thinkingBuffer);
      } else if (onStream) {
        onStream(thinkingBuffer);
      }
      thinkingBuffer = '';
    }
  };

  logger.debug('aiService', 'Processing chat request:', { provider, model, messageCount: messages?.length });
  
  const isProxy = proxyConfig.enabled === true;
  const proxyUrl = isProxy ? getProxyUrl(proxyConfig) : null;

  let targetUrl;
  
  if (provider === 'azure' || (baseUrl && baseUrl.includes('openai.azure.com'))) {
    const normalizedUrl = normalizeBaseUrl(baseUrl);
    if (normalizedUrl.includes('/chat/completions')) {
      targetUrl = normalizedUrl;
    } else {
      targetUrl = `${normalizedUrl}/openai/deployments/${model}/chat/completions?api-version=2024-02-15-preview`;
    }
  } else if (format === 'gemini') {
    const method = onStream ? 'streamGenerateContent' : 'generateContent';
    targetUrl = buildTargetUrl(baseUrl, `/models/${model}:${method}`, format, provider) + `?key=${apiKey}`;
    if (onStream) targetUrl += '&alt=sse';
  } else if (format === 'claude') {
    targetUrl = buildTargetUrl(baseUrl, '/messages', format, provider);
  } else {
    targetUrl = buildTargetUrl(baseUrl, '/chat/completions', format, provider);
  }
  
  logger.debug('aiService', 'Target URL:', targetUrl);
  
  const headers = { 'Content-Type': 'application/json' };
  
  if (provider === 'azure' || (baseUrl && baseUrl.includes('openai.azure.com'))) {
    headers['api-key'] = apiKey;
  } else if (format === 'claude') {
    headers['x-api-key'] = apiKey;
    headers['anthropic-version'] = '2023-06-01';
    headers['anthropic-dangerous-direct-browser-access'] = 'true';
  } else if (format !== 'gemini') {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const formatter = formatters[format] || formatters['openai'];
  const payload = formatter(messages, model, options);
  
  if (onStream && format !== 'gemini') {
    payload.stream = true;
  }
  
  /**
   * 执行实际的请求逻辑
   */
  const executeRequest = async () => {
    let hasStreamedData = false;
    let done = false;
    
    try {
      if (onStream) {
        const fetchUrl = (isProxy && proxyUrl) ? proxyUrl : targetUrl;
        const fetchBody = (isProxy && proxyUrl) ? {
          url: targetUrl,
          method: 'POST',
          headers: headers,
          data: payload,
          stream: true,
          taskId
        } : payload;

        const fetchOptions = {
          method: 'POST',
          headers: isProxy ? { 'Content-Type': 'application/json' } : headers,
          body: JSON.stringify(fetchBody),
          signal: signal || AbortSignal.timeout((proxyConfig.timeout || 300) * 1000)
        };
        
        const response = await fetch(fetchUrl, fetchOptions);
        
        if (!response.ok) {
          let errorMsg = `HTTP Error ${response.status}`;
          try {
            const errorText = await response.text();
            try {
              const errorData = JSON.parse(errorText);
              errorMsg = errorData.error?.message || errorData.message || errorMsg;
            } catch (e) {
              errorMsg = errorText || errorMsg;
            }
          } catch (e) {}
          throw new Error(errorMsg);
        }
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        const parser = parsers[format] || parsers['openai'];
        let buffer = '';
        let accumulatedContent = '';
        let previousContentLength = 0;
        let isAccumulativeMode = null;
        let detectionChunkCount = 0;
        const DETECTION_CHUNKS = 3;

        while (true) {
          const { value, done: readerDone } = await reader.read();
          if (value) {
            buffer += decoder.decode(value, { stream: true });
            
            let lineIndex;
            while ((lineIndex = buffer.indexOf('\n')) !== -1) {
              const line = buffer.slice(0, lineIndex).trim();
              buffer = buffer.slice(lineIndex + 1);

              if (!line || line === 'data: [DONE]') {
                if (line === 'data: [DONE]') done = true;
                continue;
              }

              try {
                const result = parser(line);
                if (result?.done) { done = true; break; }
                
                if (result?.content) {
                  if (hasNativeReasoning && onThinkingEnd && !isReasoningEnded) {
                    onThinkingEnd();
                    isReasoningEnded = true;
                  }

                  const currentContent = result.content;
                  detectionChunkCount++;
                  
                  if (isAccumulativeMode === null && detectionChunkCount <= DETECTION_CHUNKS) {
                    if (detectionChunkCount === 1) {
                      accumulatedContent = currentContent;
                      previousContentLength = Array.from(currentContent).length;
                      handleStream(currentContent);
                      hasStreamedData = true;
                    } else {
                      const isStartingWithPrevious = currentContent.startsWith(accumulatedContent);
                      if (isStartingWithPrevious) {
                        if (detectionChunkCount >= 2) isAccumulativeMode = true;
                        const newLength = Array.from(currentContent).length;
                        if (newLength > previousContentLength) {
                          const delta = Array.from(currentContent).slice(previousContentLength).join('');
                          if (delta) {
                            previousContentLength = newLength;
                            accumulatedContent = currentContent;
                            handleStream(delta);
                            hasStreamedData = true;
                          }
                        }
                      } else {
                        if (detectionChunkCount >= 2) isAccumulativeMode = false;
                        accumulatedContent += currentContent;
                        previousContentLength = Array.from(accumulatedContent).length;
                        handleStream(currentContent);
                        hasStreamedData = true;
                      }
                    }
                  } else if (isAccumulativeMode === true) {
                    const newLength = Array.from(currentContent).length;
                    if (newLength > previousContentLength) {
                      const delta = Array.from(currentContent).slice(previousContentLength).join('');
                      if (delta) {
                        previousContentLength = newLength;
                        accumulatedContent = currentContent;
                        handleStream(delta);
                        hasStreamedData = true;
                      }
                    } else if (newLength < previousContentLength) {
                      isAccumulativeMode = false;
                      handleStream(currentContent);
                      hasStreamedData = true;
                    }
                  } else {
                    accumulatedContent += currentContent;
                    previousContentLength = Array.from(accumulatedContent).length;
                    handleStream(currentContent);
                    hasStreamedData = true;
                  }
                }
                
                if (result?.reasoning && onThinking) {
                  hasNativeReasoning = true;
                  onThinking(result.reasoning);
                }
              } catch (e) {
                logger.warn('aiService', 'Stream parsing error:', e.message);
              }
            }
          }
          if (readerDone || done) break;
        }
        
        if (buffer) {
          try {
            const result = parser(buffer.trim());
            if (result?.content) handleStream(result.content);
            if (result?.reasoning) onThinking(result.reasoning);
          } catch (e) {}
        }
        flushThinkingBuffer();
      } else {
        const axiosUrl = (isProxy && proxyUrl) ? proxyUrl : targetUrl;
        const axiosData = (isProxy && proxyUrl) ? {
          url: targetUrl,
          method: 'POST',
          headers: headers,
          data: payload,
        } : payload;
        
        const axiosOptions = { 
          headers: isProxy ? { 'Content-Type': 'application/json' } : headers,
          timeout: (proxyConfig.timeout || 30) * 1000,
          signal: signal
        };
        
        const response = await axios.post(axiosUrl, axiosData, axiosOptions);
        
        if (format === 'gemini') {
          return response.data.candidates[0].content.parts[0].text;
        } else if (format === 'claude') {
          return response.data.content[0].text;
        }
        return response.data.choices[0].message.content;
      }
    } catch (error) {
      if (error.name === 'TimeoutError' || error.name === 'AbortError') {
        throw new Error('Request timeout, please check network or increase timeout');
      }
      if (error.message === 'Failed to fetch' || error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
        if (isProxy) {
          throw new Error('Network connection failed. Please check if cloud proxy API is accessible and properly configured.');
        } else {
          throw new Error('Network connection failed. This may be due to CORS restrictions. Consider enabling proxy mode.');
        }
      }

      if (onStream && hasStreamedData) error.noRetry = true;
      throw error;
    }
  };

  return withRetry(executeRequest);
}

/**
 * 恢复中断的异步任务
 * @param {string} taskId - 任务 ID
 * @param {object} proxyConfig - 代理配置
 * @returns {Promise<object>} 任务数据
 */
export async function resumeTask(taskId, proxyConfig = {}) {
  const isProxy = proxyConfig.enabled === true;
  if (!isProxy) {
    throw new Error('Task resumption requires proxy mode to be enabled');
  }

  const proxyUrl = getProxyUrl(proxyConfig);
  const baseUrl = proxyUrl.substring(0, proxyUrl.lastIndexOf('/api/proxy'));
  const taskUrl = `${baseUrl}/api/proxy/task/${taskId}`;

  logger.debug('aiService', 'Resuming task:', taskId, 'via', taskUrl);

  try {
    const response = await axios.get(taskUrl, {
      timeout: 10000
    });
    return response.data;
  } catch (error) {
    logger.error('aiService', 'Failed to resume task:', error);
    throw error;
  }
}

/**
 * 对话内容自动压缩
 * @param {object} params - 压缩参数
 * @returns {Promise<string>} 压缩后的摘要
 */
export async function compressMessages(params) {
  const { messages, provider, model, apiKey, baseUrl, proxyConfig, format } = params;
  const compressionMessages = [
    {
      role: 'system',
      content: 'You are a professional conversation compression assistant. Compress the conversation into a concise summary. Output the summary directly.'
    },
    {
      role: 'user',
      content: `Please compress:\n\n${messages.map((m, i) => `[${i+1}] ${m.role}: ${JSON.stringify(m.content)}`).join('\n')}`
    }
  ];
  
  try {
    const res = await chatCompletion({
      provider, model, messages: compressionMessages, apiKey, baseUrl, proxyConfig, format,
      options: { temperature: 0.3, max_tokens: 1000 }, stream: false
    });
    return res;
  } catch (error) {
    throw new Error(`Compression failed: ${error.message}`);
  }
}

/**
 * AI 图像生成接口
 * @param {object} params - 包含 prompt, model, provider 等配置
 * @returns {Promise<Array>} 生成的图像 URL 列表 (Base64 或 远程地址)
 */
export async function generateImage({
  provider,
  model,
  prompt,
  negativePrompt,
  apiKey,
  baseUrl,
  options = {},
  proxyConfig = {},
  format = 'openai'
}) {
  const isProxy = proxyConfig.enabled === true;
  const proxyUrl = isProxy ? getProxyUrl(proxyConfig) : null;
  
  let targetUrl;
  let payload;
  const headers = { 'Content-Type': 'application/json' };

  if (provider === 'azure' || (baseUrl && baseUrl.includes('openai.azure.com'))) {
    headers['api-key'] = apiKey;
  } else if (provider !== AI_PROVIDERS.GOOGLE && format !== 'gemini' && format !== 'google') {
    if (provider === 'perplexity' || (baseUrl && baseUrl.includes('api.perplexity.ai'))) {
      headers['Authorization'] = apiKey;
    } else {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }
  }

  const size = `${options.width || 1024}x${options.height || 1024}`;
  const batchSize = options.batchSize || 1;
  const seed = options.seed === -1 ? Math.floor(Math.random() * 2147483647) : options.seed;

  if (provider === AI_PROVIDERS.GOOGLE || format === 'gemini') {
    targetUrl = buildTargetUrl(baseUrl, `/models/${model}:generateContent`, format, provider) + `?key=${apiKey}`;
    const parts = [];
    if (options.image) {
       const matches = options.image.match(/^data:([^;]+);base64,(.+)$/);
       if (matches) parts.push({ inline_data: { mime_type: matches[1], data: matches[2] } });
    }
    if (prompt) parts.push({ text: prompt });
    if (negativePrompt) parts.push({ text: `Negative prompt: ${negativePrompt}` });

    payload = {
      contents: [{ parts }],
      generationConfig: { candidateCount: batchSize }
    };
  } 
  else if (provider === AI_PROVIDERS.OPENAI) {
    targetUrl = buildTargetUrl(baseUrl, '/images/generations', 'openai', provider);
    payload = {
      model,
      prompt,
      n: batchSize,
      size: size,
      response_format: 'b64_json',
      ...(!model.includes('dall-e-3') && { seed, steps: options.steps, cfg_scale: options.cfgScale })
    };
    if (model.includes('dall-e-3')) delete payload.n;
  }
  else if (provider === AI_PROVIDERS.SILICONFLOW) {
    targetUrl = buildTargetUrl(baseUrl, '/images/generations', 'openai', provider);
    payload = {
      model,
      prompt,
      negative_prompt: negativePrompt || '',
      image_size: size,
      batch_size: batchSize,
      seed: seed,
      num_inference_steps: options.steps || 20,
      guidance_scale: options.cfgScale || 7.5,
      response_format: 'b64_json'
    };
  }
  else {
    targetUrl = buildTargetUrl(baseUrl, '/images/generations', 'openai', provider);
    payload = {
      model,
      prompt,
      n: batchSize,
      size: size,
      negative_prompt: negativePrompt,
      seed: seed,
      num_inference_steps: options.steps,
      guidance_scale: options.cfgScale,
      response_format: 'b64_json'
    };
  }

  /**
   * 执行图像生成请求
   */
  const executeRequest = async () => {
    try {
      const axiosUrl = (isProxy && proxyUrl) ? proxyUrl : targetUrl;
      const axiosData = (isProxy && proxyUrl) ? {
        url: targetUrl,
        method: 'POST',
        headers,
        data: payload,
      } : payload;
      const axiosHeaders = isProxy ? { 'Content-Type': 'application/json' } : headers;

      const response = await axios.post(axiosUrl, axiosData, {
        headers: axiosHeaders,
        timeout: (options.timeout || 120) * 1000
      });

      const data = response.data;
      let imageUrls = [];

      if (data.data && Array.isArray(data.data)) {
        imageUrls = data.data.map(item => item.b64_json ? `data:image/png;base64,${item.b64_json}` : item.url);
      } else if (data.output && Array.isArray(data.output.results)) {
        imageUrls = data.output.results.map(res => res.url || res.b64_json);
      } else if (data.output && data.output.choices && data.output.choices[0]?.message?.content) {
        const content = data.output.choices[0].message.content;
        if (Array.isArray(content)) {
          imageUrls = content.filter(item => item.image).map(item => item.image);
        }
      } else if (data.images && Array.isArray(data.images)) {
        imageUrls = data.images.map(img => typeof img === 'string' ? img : img.url);
      } else if (data.url) {
        imageUrls = [data.url];
      }

      if (imageUrls.length === 0) throw new Error('Failed to get generated image content');
      return imageUrls;
    } catch (error) {
      logger.error('aiService', 'Image generation failed:', error);
      let detail = error.response?.data?.error?.message || error.response?.data?.message || error.message;
      
      if (error.message === 'Network Error' || error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        if (isProxy) {
          detail = 'Unable to connect to proxy server. Please ensure the proxy service (npm run proxy) is running and accessible.';
        } else {
          detail = 'Network connection failed. This may be due to CORS restrictions or network blockage. Consider enabling proxy mode in settings.';
        }
      }
      
      if (detail.includes('status code 404')) {
        detail = 'Requested image generation endpoint does not exist (404). This usually means the model does not support image generation or the API path is incorrect.';
      } else if (detail.includes('status code 401')) {
        detail = 'Authentication failed (401). Please check if your API Key is correct and has not expired.';
      } else if (detail.includes('status code 403')) {
        detail = 'Permission denied (403). Your API Key may not have permission to use this specific model.';
      }
      
      throw new Error(`Image generation failed: ${detail}`);
    }
  };

  return withRetry(executeRequest, 1);
}