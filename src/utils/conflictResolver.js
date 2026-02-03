/**
 * 冲突检测和解决工具模块
 * 用于处理云端同步时的数据冲突
 */

import { logger } from '../services/logger';

/**
 * 冲突类型枚举
 */
export const ConflictType = {
  TIMESTAMP: 'timestamp',      // 时间戳冲突
  DELETION: 'deletion',        // 删除冲突
  MODIFICATION: 'modification', // 修改冲突
  CREATION: 'creation'         // 创建冲突
};

/**
 * 解决策略枚举
 */
export const ResolutionStrategy = {
  LOCAL_WINS: 'local_wins',           // 本地优先
  REMOTE_WINS: 'remote_wins',         // 远程优先
  TIMESTAMP: 'timestamp',             // 时间戳优先(最新的优先)
  MANUAL: 'manual',                   // 手动选择
  MERGE: 'merge'                      // 智能合并
};

/**
 * 检测数据冲突
 * @param {object} localItem - 本地数据项
 * @param {object} remoteItem - 云端数据项
 * @returns {object|null} 冲突信息,无冲突返回null
 */
export function detectConflict(localItem, remoteItem) {
  // 如果其中一个不存在,不算冲突
  if (!localItem || !remoteItem) {
    return null;
  }

  // 检查是否有lastUpdatedAt或updatedAt字段
  const localTime = localItem.lastUpdatedAt || localItem.updatedAt || 0;
  const remoteTime = remoteItem.lastUpdatedAt || remoteItem.updatedAt || 0;

  // 如果时间戳相同,无冲突
  if (localTime === remoteTime) {
    return null;
  }

  // 检查内容是否相同
  const localContent = JSON.stringify(localItem);
  const remoteContent = JSON.stringify(remoteItem);
  
  if (localContent === remoteContent) {
    return null;
  }

  // 确定冲突类型
  let conflictType = ConflictType.MODIFICATION;
  
  if (localItem.deleted && !remoteItem.deleted) {
    conflictType = ConflictType.DELETION;
  } else if (!localItem.deleted && remoteItem.deleted) {
    conflictType = ConflictType.DELETION;
  } else if (Math.abs(localTime - remoteTime) < 1000) {
    // 1秒内的修改可能是同时编辑
    conflictType = ConflictType.TIMESTAMP;
  }

  return {
    type: conflictType,
    local: {
      data: localItem,
      timestamp: localTime,
      id: localItem.id
    },
    remote: {
      data: remoteItem,
      timestamp: remoteTime,
      id: remoteItem.id
    },
    timeDiff: Math.abs(localTime - remoteTime)
  };
}

/**
 * 批量检测冲突
 * @param {Array} localData - 本地数据数组
 * @param {Array} remoteData - 云端数据数组
 * @returns {Array} 冲突列表
 */
export function detectConflicts(localData, remoteData) {
  if (!Array.isArray(localData) || !Array.isArray(remoteData)) {
    return [];
  }

  const conflicts = [];
  
  // 创建本地数据映射
  const localMap = new Map(localData.map(item => [item.id, item]));
  
  // 检查每个远程项
  for (const remoteItem of remoteData) {
    const localItem = localMap.get(remoteItem.id);
    const conflict = detectConflict(localItem, remoteItem);
    
    if (conflict) {
      conflicts.push(conflict);
    }
  }

  logger.info('ConflictResolver', `Detected ${conflicts.length} conflicts`);
  return conflicts;
}

/**
 * 解决单个冲突
 * @param {object} conflict - 冲突对象
 * @param {string} strategy - 解决策略
 * @returns {object} 解决后的数据
 */
export function resolveConflict(conflict, strategy = ResolutionStrategy.TIMESTAMP) {
  if (!conflict) {
    return null;
  }

  switch (strategy) {
    case ResolutionStrategy.LOCAL_WINS:
      return conflict.local.data;
    
    case ResolutionStrategy.REMOTE_WINS:
      return conflict.remote.data;
    
    case ResolutionStrategy.TIMESTAMP:
      // 选择最新时间戳的版本
      return conflict.local.timestamp > conflict.remote.timestamp
        ? conflict.local.data
        : conflict.remote.data;
    
    case ResolutionStrategy.MERGE:
      // 智能合并(仅适用于特定数据类型)
      return mergeConflictData(conflict.local.data, conflict.remote.data);
    
    case ResolutionStrategy.MANUAL:
      // 手动解决需要返回冲突信息,由UI处理
      return conflict;
    
    default:
      logger.warn('ConflictResolver', `Unknown strategy: ${strategy}, using TIMESTAMP`);
      return resolveConflict(conflict, ResolutionStrategy.TIMESTAMP);
  }
}

/**
 * 批量解决冲突
 * @param {Array} conflicts - 冲突列表
 * @param {string} strategy - 解决策略
 * @returns {Array} 解决后的数据列表
 */
export function resolveConflicts(conflicts, strategy = ResolutionStrategy.TIMESTAMP) {
  if (!Array.isArray(conflicts)) {
    return [];
  }

  const resolved = conflicts.map(conflict => ({
    id: conflict.local.id,
    data: resolveConflict(conflict, strategy),
    wasConflict: true,
    strategy: strategy
  }));

  logger.info('ConflictResolver', `Resolved ${resolved.length} conflicts using strategy: ${strategy}`);
  return resolved;
}

/**
 * 智能合并冲突数据
 * @param {object} local - 本地数据
 * @param {object} remote - 远程数据
 * @returns {object} 合并后的数据
 */
function mergeConflictData(local, remote) {
  // 基础合并策略:保留两边都有的字段,优先使用最新的
  const merged = { ...local };
  
  for (const key in remote) {
    if (remote.hasOwnProperty(key)) {
      // 如果本地没有这个字段,使用远程的
      if (!(key in local)) {
        merged[key] = remote[key];
      }
      // 如果是数组,尝试合并
      else if (Array.isArray(local[key]) && Array.isArray(remote[key])) {
        merged[key] = mergeArrays(local[key], remote[key]);
      }
      // 如果是对象,递归合并
      else if (typeof local[key] === 'object' && typeof remote[key] === 'object' && 
               local[key] !== null && remote[key] !== null) {
        merged[key] = mergeConflictData(local[key], remote[key]);
      }
      // 其他情况,使用最新的(这里假设remote是最新的)
      else {
        merged[key] = remote[key];
      }
    }
  }
  
  return merged;
}

/**
 * 合并数组(去重)
 * @param {Array} arr1 - 数组1
 * @param {Array} arr2 - 数组2
 * @returns {Array} 合并后的数组
 */
function mergeArrays(arr1, arr2) {
  // 如果数组元素是对象,按id去重
  if (arr1.length > 0 && typeof arr1[0] === 'object' && arr1[0] !== null && 'id' in arr1[0]) {
    const map = new Map();
    for (const item of [...arr1, ...arr2]) {
      map.set(item.id, item);
    }
    return Array.from(map.values());
  }
  
  // 简单去重
  return [...new Set([...arr1, ...arr2])];
}

/**
 * 对话数据专用的合并策略
 * @param {object} localConversation - 本地对话
 * @param {object} remoteConversation - 远程对话
 * @returns {object} 合并后的对话
 */
export function mergeConversations(localConversation, remoteConversation) {
  // 基本字段使用最新的
  const merged = {
    ...localConversation,
    ...remoteConversation
  };
  
  // 特殊处理messages - 按时间戳合并
  if (localConversation.messages && remoteConversation.messages) {
    const allMessages = [...localConversation.messages, ...remoteConversation.messages];
    const messageMap = new Map();
    
    for (const msg of allMessages) {
      const existing = messageMap.get(msg.id);
      if (!existing || msg.createdAt > existing.createdAt) {
        messageMap.set(msg.id, msg);
      }
    }
    
    merged.messages = Array.from(messageMap.values())
      .sort((a, b) => a.createdAt - b.createdAt);
  }
  
  // 使用最新的更新时间
  merged.lastUpdatedAt = Math.max(
    localConversation.lastUpdatedAt || 0,
    remoteConversation.lastUpdatedAt || 0
  );
  
  return merged;
}

/**
 * 消息数据专用的合并策略
 * @param {Array} localMessages - 本地消息列表
 * @param {Array} remoteMessages - 远程消息列表
 * @returns {Array} 合并后的消息列表
 */
export function mergeMessages(localMessages, remoteMessages) {
  const messageMap = new Map();
  
  // 添加所有消息,按ID去重,保留最新的
  for (const msg of [...localMessages, ...remoteMessages]) {
    const existing = messageMap.get(msg.id);
    if (!existing || (msg.updatedAt || msg.createdAt) > (existing.updatedAt || existing.createdAt)) {
      messageMap.set(msg.id, msg);
    }
  }
  
  // 按创建时间排序
  return Array.from(messageMap.values())
    .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
}

/**
 * 检查是否需要合并
 * @param {object} local - 本地数据
 * @param {object} remote - 远程数据
 * @returns {boolean} 是否需要合并
 */
export function needsMerge(local, remote) {
  if (!local || !remote) {
    return false;
  }
  
  const conflict = detectConflict(local, remote);
  return conflict !== null;
}

/**
 * 获取冲突摘要
 * @param {Array} conflicts - 冲突列表
 * @returns {object} 冲突摘要
 */
export function getConflictSummary(conflicts) {
  const summary = {
    total: conflicts.length,
    byType: {},
    oldestConflict: null,
    newestConflict: null
  };
  
  for (const conflict of conflicts) {
    // 按类型统计
    summary.byType[conflict.type] = (summary.byType[conflict.type] || 0) + 1;
    
    // 记录最早和最新的冲突
    const conflictTime = Math.max(conflict.local.timestamp, conflict.remote.timestamp);
    if (!summary.newestConflict || conflictTime > summary.newestConflict.timestamp) {
      summary.newestConflict = { ...conflict, timestamp: conflictTime };
    }
    if (!summary.oldestConflict || conflictTime < summary.oldestConflict.timestamp) {
      summary.oldestConflict = { ...conflict, timestamp: conflictTime };
    }
  }
  
  return summary;
}
