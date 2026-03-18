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

/**
 * 请求处理程序
 * @param {object} context - 请求上下文
 * @returns {Promise<Response>} HTTP 响应
 */
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

/**
 * 处理下载请求
 * GET /api/sync/:userId
 *
 * @param {object}  KV      - KV 命名空间实例
 * @param {string}  userId  - 用户 ID（来自路由参数）
 * @param {Request} request - 请求对象
 * @param {object}  env     - 环境变量对象
 * @returns {Promise<Response>}
 */
async function handleDownload(KV, userId, request, env) {
  // 身份认证校验
  // userId 来自路由参数，已由路由匹配保证非空，可直接传入做一致性校验
  const auth = await verifyAuth(request, env, userId);
  if (!auth.ok) {
    return auth.response;
  }

  const url      = new URL(request.url);
  const dataType = url.searchParams.get('dataType');

  // dataType 存在时须在白名单内，防止非法枚举
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
                [],
          count:     0,
          timestamp: new Date().toISOString()
        }, 200);
      }

      return jsonResponse({
        success:   true,
              [data],
        count:     1,
        timestamp: new Date().toISOString()
      }, 200);
    }

    // 获取该用户所有数据类型
    const results = await Promise.all(
      VALID_DATA_TYPES.map(async (type) => {
        const item = await KV.get(`sync:${userId}:${type}`, { type: 'json' });
        return item ? { dataType: type, ...item } : null;
      })
    );

    const data = results.filter(Boolean);

    return jsonResponse({
      success:   true,
            data,
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

/**
 * 处理上传请求
 * POST /api/sync
 *
 * @param {object}  KV      - KV 命名空间实例
 * @param {Request} request - 请求对象
 * @param {object}  env     - 环境变量对象
 * @returns {Promise<Response>}
 */
async function handleUpload(KV, request, env) {
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return jsonResponse({ success: false, error: 'Invalid JSON body' }, 400);
  }

  const { userId, dataType, encryptedData, version, checksum } = body;

  // 必填字段校验须在 verifyAuth 之前执行。
  // verifyAuth 会将请求头中的 userId 与 bodyUserId 做一致性比对，
  // 若 bodyUserId 为 undefined，该比对会被静默跳过，导致越权校验失效。
  if (!userId || !dataType || !encryptedData) {
    return jsonResponse({
      success: false,
      error: 'Missing required fields: userId, dataType, encryptedData'
    }, 400);
  }

  // 身份认证校验
  const auth = await verifyAuth(request, env, userId);
  if (!auth.ok) {
    return auth.response;
  }

  // 数据大小校验，防止超大请求耗尽 KV 存储
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

/**
 * 处理删除请求
 * DELETE /api/sync/:userId
 *
 * @param {object}  KV      - KV 命名空间实例
 * @param {string}  userId  - 用户 ID（来自路由参数）
 * @param {Request} request - 请求对象
 * @param {object}  env     - 环境变量对象
 * @returns {Promise<Response>}
 */
async function handleDelete(KV, userId, request, env) {
  // 身份认证校验
  // userId 来自路由参数，已由路由匹配保证非空，可直接传入做一致性校验
  const auth = await verifyAuth(request, env, userId);
  if (!auth.ok) {
    return auth.response;
  }

  let dataType;
  try {
    const body = await request.json();
    dataType   = body.dataType;
  } catch (e) {
    // DELETE 请求体可选，解析失败时视为全量删除
    dataType = null;
  }

  // dataType 存在时须在白名单内，防止非法枚举
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
      // 全量删除该用户所有数据类型
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
