/**
 * Cloudflare Workers 云端同步接口
 * 使用 KV 存储实现轻量级数据同步，提供身份认证、数据校验及访问控制。
 */

import { verifyAuth, jsonResponse } from '../auth.js';

/**
 * 允许的数据类型白名单
 */
const VALID_DATA_TYPES = [
  'config',
  'conversations',
  'messages',
  'images',
  'published',
  'knowledgeBases',
  'systemLogs'
];

/**
 * 请求体中加密数据字段允许的最大字节长度（10 MB）
 */
const MAX_DATA_BYTES = 10 * 1024 * 1024;

export async function onRequest(context) {
  const { request, env, params } = context;
  const path = params.path?.[0] || '';

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204 });
  }

  const KV = env.SYNC_DATA;

  if (!KV) {
    return jsonResponse({
      success: false,
      error: 'KV namespace not configured. Please bind a KV namespace named SYNC_DATA.'
    }, 500);
  }

  if (request.method === 'GET' && path) {
    return handleDownload(KV, path, request, env);
  }

  if (request.method === 'POST' && !path) {
    return handleUpload(KV, request, env);
  }

  if (request.method === 'DELETE' && path) {
    return handleDelete(KV, path, request, env);
  }

  return jsonResponse({ success: false, error: 'Invalid request method or path' }, 400);
}

async function handleDownload(KV, userId, request, env) {
  const auth = await verifyAuth(request, env, userId);
  if (!auth.ok) {
    return auth.response;
  }

  const url      = new URL(request.url);
  const dataType = url.searchParams.get('dataType');

  if (dataType && !VALID_DATA_TYPES.includes(dataType)) {
    return jsonResponse({
      success: false,
      error: `Invalid dataType. Must be one of: ${VALID_DATA_TYPES.join(', ')}`
    }, 400);
  }

  try {
    if (dataType) {
      const data = await KV.get(`sync:${userId}:${dataType}`, { type: 'json' });

      if (!data) {
        return jsonResponse({
          success:   true,
                [],       // ← 修复：补回  键名
          count:     0,
          timestamp: new Date().toISOString()
        }, 200);
      }

      return jsonResponse({
        success:   true,
              [data],    // ← 修复：补回  键名
        count:     1,
        timestamp: new Date().toISOString()
      }, 200);
    }

    const results = await Promise.all(
      VALID_DATA_TYPES.map(async (type) => {
        const item = await KV.get(`sync:${userId}:${type}`, { type: 'json' });
        return item ? { dataType: type, ...item } : null;
      })
    );

    const data = results.filter(Boolean);

    return jsonResponse({
      success:   true,
            data,        // ← 修复：补回  键名
      count:     data.length,
      timestamp: new Date().toISOString()
    }, 200);

  } catch (error) {
    console.error(`[Sync:Download] userId=${userId} error:`, error.message);
    return jsonResponse({
      success:   false,
      error:     'An internal error occurred. Please try again later.',
      timestamp: new Date().toISOString()
    }, 500);
  }
}

async function handleUpload(KV, request, env) {
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return jsonResponse({ success: false, error: 'Invalid JSON body' }, 400);
  }

  const { userId, dataType, encryptedData, version, checksum } = body;

  if (!userId || !dataType || !encryptedData) {
    return jsonResponse({
      success: false,
      error: 'Missing required fields: userId, dataType, encryptedData'
    }, 400);
  }

  const auth = await verifyAuth(request, env, userId);
  if (!auth.ok) {
    return auth.response;
  }

  const dataBytes = new TextEncoder().encode(String(encryptedData)).length;
  if (dataBytes > MAX_DATA_BYTES) {
    return jsonResponse({
      success: false,
      error: 'Payload too large: encryptedData exceeds the 10 MB limit'
    }, 413);
  }

  if (!VALID_DATA_TYPES.includes(dataType)) {
    return jsonResponse({
      success: false,
      error: `Invalid dataType. Must be one of: ${VALID_DATA_TYPES.join(', ')}`
    }, 400);
  }

  try {
    const newVersion = version || Date.now();

    await KV.put(`sync:${userId}:${dataType}`, JSON.stringify({
      dataType,
      encryptedData,
      version:   newVersion,
      checksum:  checksum || null,
      timestamp: new Date().toISOString()
    }));

    return jsonResponse({
      success:   true,
      version:   newVersion,
      dataType:  dataType,
      timestamp: new Date().toISOString()
    }, 200);

  } catch (error) {
    console.error(`[Sync:Upload] userId=${userId} dataType=${dataType} error:`, error.message);
    return jsonResponse({
      success:   false,
      error:     'An internal error occurred. Please try again later.',
      timestamp: new Date().toISOString()
    }, 500);
  }
}

async function handleDelete(KV, userId, request, env) {
  const auth = await verifyAuth(request, env, userId);
  if (!auth.ok) {
    return auth.response;
  }

  let dataType;
  try {
    const body = await request.json();
    dataType   = body.dataType;
  } catch (e) {
    dataType = null;
  }

  if (dataType && !VALID_DATA_TYPES.includes(dataType)) {
    return jsonResponse({
      success: false,
      error: `Invalid dataType. Must be one of: ${VALID_DATA_TYPES.join(', ')}`
    }, 400);
  }

  try {
    let deletedTypes = [];

    if (dataType) {
      await KV.delete(`sync:${userId}:${dataType}`);
      deletedTypes = [dataType];
    } else {
      await Promise.all(
        VALID_DATA_TYPES.map(type => KV.delete(`sync:${userId}:${type}`))
      );
      deletedTypes = VALID_DATA_TYPES;
    }

    return jsonResponse({
      success:      true,
      deletedTypes: deletedTypes,
      timestamp:    new Date().toISOString()
    }, 200);

  } catch (error) {
    console.error(`[Sync:Delete] userId=${userId} error:`, error.message);
    return jsonResponse({
      success:   false,
      error:     'An internal error occurred. Please try again later.',
      timestamp: new Date().toISOString()
    }, 500);
  }
}
