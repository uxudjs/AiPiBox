/**
 * Cloudflare Workers 云端同步接口
 * 使用 KV 存储实现轻量级数据同步
 */

export async function onRequest(context) {
  const { request, env, params } = context;
  const path = params.path?.[0] || '';

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,HEAD,POST,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // 绑定 KV 命名空间
  const KV = env.SYNC_DATA;

  if (!KV) {
    return new Response(JSON.stringify({
      error: 'KV namespace not configured',
      message: 'Please bind a KV namespace named SYNC_DATA'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  let response;
  // 路由分发逻辑
  if (request.method === 'GET' && path) {
    // 处理数据获取
    response = await handleDownload(KV, path, request);
  } else if (request.method === 'POST' && !path) {
    // 处理数据保存
    response = await handleUpload(KV, request);
  } else if (request.method === 'DELETE' && path) {
    // 处理数据移除
    response = await handleDelete(KV, path);
  } else {
    response = new Response(JSON.stringify({
      error: 'Invalid request'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 为所有响应添加 CORS 头
  const newResponse = new Response(response.body, response);
  Object.keys(corsHeaders).forEach(key => {
    newResponse.headers.set(key, corsHeaders[key]);
  });
  return newResponse;
}

/**
 * 处理下载请求
 * @param {Object} KV KV 实例
 * @param {string} id 资源标识符
 * @param {Request} request 请求对象
 */
async function handleDownload(KV, id, request) {
  try {
    const data = await KV.get(`sync:${id}`, { type: 'json' });

    if (!data) {
      return new Response(JSON.stringify({
        error: 'Data not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * 处理上传请求
 * @param {Object} KV KV 实例
 * @param {Request} request 请求对象
 */
async function handleUpload(KV, request) {
  try {
    const body = await request.json();
    const { id, data, timestamp } = body;

    if (!id || !data || !timestamp) {
      return new Response(JSON.stringify({
        error: 'Missing required fields'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 保存到KV
    await KV.put(`sync:${id}`, JSON.stringify({ data, timestamp }), {
      metadata: { lastUpdated: Date.now() }
    });

    return new Response(JSON.stringify({
      success: true,
      timestamp: Date.now()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * 处理删除请求
 * @param {Object} KV KV 实例
 * @param {string} id 资源标识符
 */
async function handleDelete(KV, id) {
  try {
    await KV.delete(`sync:${id}`);

    return new Response(JSON.stringify({
      success: true
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
