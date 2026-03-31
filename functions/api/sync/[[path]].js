/**
 * Cloudflare Workers 云端同步接口
 * 使用 KV 存储实现轻量级数据同步，提供身份认证、数据校验及访问控制。
 */

import { verifyAuth, verifyGlobalAuth, jsonResponse } from '../auth.js';

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

  // 全局访问权限校验
  const globalAuth = await verifyGlobalAuth(request, env);
  if (!globalAuth.ok) {
    return globalAuth.response;
  }

  const KV = env.SYNC_DATA;

  if (!KV) {
    return jsonResponse({
      success: false,
      error: 'KV namespace not configured. Please bind a KV namespace named SYNC_DATA.'
    }, 500);
  }

  if (request.method === 'GET' && path) {
    return handleDownload(KV, path, request);
  }

  if (request.method === 'POST' && !path) {
    return handleUpload(KV, request);
  }

  if (request.method === 'DELETE' && path) {
    return handleDelete(KV, path, request);
  }

  return jsonResponse({ success: false, error: 'Invalid request method or path' }, 400);
}

/**
 * 处理下载请求
 * GET /api/sync/:syncId
 *
 * @param {object}  KV      - KV 命名空间实例
 * @param {string}  syncId  - 同步标识符（来自路由参数）
 * @param {Request} request - 请求对象
 * @returns {Promise<Response>}
 */
async function handleDownload(KV, syncId, request) {
  const auth = await verifyAuth(request, syncId);
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const value = await KV.get(`sync:${syncId}`, { type: 'json' });

    if (!value) {
      return jsonResponse({
        success: false,
        error: 'No sync data found'
      }, 404);
    }

    return jsonResponse({
      success:   true,
      data:      value.data,
      timestamp: value.timestamp
    }, 200);

  } catch (error) {
    console.error(`[Sync:Download] syncId=${syncId} error:`, error.message);
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
 * @returns {Promise<Response>}
 */
async function handleUpload(KV, request) {
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return jsonResponse({ success: false, error: 'Invalid JSON body' }, 400);
  }

  // 前端上传时 body 字段为 { id, data, timestamp }
  const { id: syncId, data: encryptedData, timestamp } = body;

  // 必填字段校验须在 verifyAuth 之前执行，
  // 确保 syncId 非空后再传入 verifyAuth 做签名校验。
  if (!syncId || !encryptedData) {
    return jsonResponse({
      success: false,
      error: 'Missing required fields: id, data'
    }, 400);
  }

  const auth = await verifyAuth(request, syncId);
  if (!auth.ok) {
    return auth.response;
  }

  const dataBytes = new TextEncoder().encode(String(encryptedData)).length;
  if (dataBytes > MAX_DATA_BYTES) {
    return jsonResponse({
      success: false,
      error: 'Payload too large: data exceeds the 10 MB limit'
    }, 413);
  }

  try {
    const version = timestamp || Date.now();

    await KV.put(`sync:${syncId}`, JSON.stringify({
      data:      encryptedData,
      version:   version,
      timestamp: new Date().toISOString()
    }));

    return jsonResponse({
      success:   true,
      version:   version,
      timestamp: new Date().toISOString()
    }, 200);

  } catch (error) {
    console.error(`[Sync:Upload] syncId=${syncId} error:`, error.message);
    return jsonResponse({
      success:   false,
      error:     'An internal error occurred. Please try again later.',
      timestamp: new Date().toISOString()
    }, 500);
  }
}

/**
 * 处理删除请求
 * DELETE /api/sync/:syncId
 *
 * @param {object}  KV      - KV 命名空间实例
 * @param {string}  syncId  - 同步标识符（来自路由参数）
 * @param {Request} request - 请求对象
 * @returns {Promise<Response>}
 */
async function handleDelete(KV, syncId, request) {
  const auth = await verifyAuth(request, syncId);
  if (!auth.ok) {
    return auth.response;
  }

  try {
    await KV.delete(`sync:${syncId}`);

    return jsonResponse({
      success:   true,
      timestamp: new Date().toISOString()
    }, 200);

  } catch (error) {
    console.error(`[Sync:Delete] syncId=${syncId} error:`, error.message);
    return jsonResponse({
      success:   false,
      error:     'An internal error occurred. Please try again later.',
      timestamp: new Date().toISOString()
    }, 500);
  }
}
