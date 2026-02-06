/**
 * 冲突检测与解决工具
 * 用于处理云端同步过程中的数据冲突，提供多种解决策略。
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
 * 检测单项数据冲突
 * @param {object} localItem - 本地数据项
 * @param {object} remoteItem - 云端数据项
 * @returns {object|null} 冲突信息
 */
export function detectConflict(localItem, remoteItem) {
  if (!localItem || !remoteItem) {
    return null;
  }

  const localTime = localItem.lastUpdatedAt || localItem.updatedAt || 0;
  const remoteTime = remoteItem.lastUpdatedAt || remoteItem.updatedAt || 0;

  if (localTime === remoteTime) {
    return null;
  }

  const localContent = JSON.stringify(localItem);
  const remoteContent = JSON.stringify(remoteItem);
  
  if (localContent === remoteContent) {
    return null;
  }

  let conflictType = ConflictType.MODIFICATION;
  
  if (localItem.deleted && !remoteItem.deleted) {
    conflictType = ConflictType.DELETION;
  } else if (!localItem.deleted && remoteItem.deleted) {
    conflictType = ConflictType.DELETION;
  } else if (Math.abs(localTime - remoteTime) < 1000) {
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
  const localMap = new Map(localData.map(item => [item.id, item]));
  
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
      return conflict.local.timestamp > conflict.remote.timestamp
        ? conflict.local.data
        : conflict.remote.data;
    
    case ResolutionStrategy.MERGE:
      return mergeConflictData(conflict.local.data, conflict.remote.data);
    
    case ResolutionStrategy.MANUAL:
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
  const merged = { ...local };
  
  for (const key in remote) {
    if (Object.prototype.hasOwnProperty.call(remote, key)) {
      if (!(key in local)) {
        merged[key] = remote[key];
      }
      else if (Array.isArray(local[key]) && Array.isArray(remote[key])) {
        merged[key] = mergeArrays(local[key], remote[key]);
      }
      else if (typeof local[key] === 'object' && typeof remote[key] === 'object' && 
               local[key] !== null && remote[key] !== null) {
        merged[key] = mergeConflictData(local[key], remote[key]);
      }
      else {
        merged[key] = remote[key];
      }
    }
  }
  
  return merged;
}

/**
 * 合并数组并去重
 * @param {Array} arr1 - 数组 1
 * @param {Array} arr2 - 数组 2
 * @returns {Array} 合并后的数组
 */
function mergeArrays(arr1, arr2) {
  if (arr1.length > 0 && typeof arr1[0] === 'object' && arr1[0] !== null && 'id' in arr1[0]) {
    const map = new Map();
    for (const item of [...arr1, ...arr2]) {
      map.set(item.id, item);
    }
    return Array.from(map.values());
  }
  
  return [...new Set([...arr1, ...arr2])];
}

/**
 * 对话数据专用的合并策略
 * @param {object} localConversation - 本地对话
 * @param {object} remoteConversation - 远程对话
 * @returns {object} 合并后的对话
 */
export function mergeConversations(localConversation, remoteConversation) {
  const merged = {
    ...localConversation,
    ...remoteConversation
  };
  
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
  
  merged.lastUpdatedAt = Math.max(
    localConversation.lastUpdatedAt || 0,
    remoteConversation.lastUpdatedAt || 0
  );
  
  return merged;
}

/**
 * 消息列表专用的合并策略
 * @param {Array} localMessages - 本地消息列表
 * @param {Array} remoteMessages - 远程消息列表
 * @returns {Array} 合并后的消息列表
 */
export function mergeMessages(localMessages, remoteMessages) {
  const messageMap = new Map();
  
  for (const msg of [...localMessages, ...remoteMessages]) {
    const existing = messageMap.get(msg.id);
    if (!existing || (msg.updatedAt || msg.createdAt) > (existing.updatedAt || existing.createdAt)) {
      messageMap.set(msg.id, msg);
    }
  }
  
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
  
  return detectConflict(local, remote) !== null;
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
    summary.byType[conflict.type] = (summary.byType[conflict.type] || 0) + 1;
    
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