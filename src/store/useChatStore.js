/**
 * 聊天业务 Store
 * 处理对话生命周期、消息树管理、AI 生成状态及自动命名等核心逻辑。
 */

import { create } from 'zustand';
import { db, recordDeletion, recordBatchDeletion } from '../db';
import { chatCompletion, resumeTask } from '../services/aiService';
import { useConfigStore } from './useConfigStore';
import { logger } from '../services/logger';
import { syncService } from '../services/syncService';
import { useI18nStore } from '../i18n';

export const useChatStore = create((set, get) => ({
  currentConversationId: null,
  isIncognito: false,
  incognitoMessages: [],
  currentModel: null,
  
  conversationStates: {}, 
  selectedConversations: [],
  
  pendingConversationSettings: null,
  
  isReasoning: false,
  reasoningContent: '',
  isAIGenerating: false,
  streamingMessage: null,
  abortController: null,

  /**
   * 切换隐身模式状态
   * @param {boolean} val - 是否开启隐身模式
   */
  setIncognito: (val) => set({ isIncognito: val, incognitoMessages: [] }),
  
  /**
   * 设置当前活跃对话并清理空对话
   * @param {string} id - 对话 ID
   */
  setCurrentConversation: async (id) => {
    const { currentConversationId, checkAndCleanupEmptyConversation } = get();
    if (currentConversationId && currentConversationId !== id && currentConversationId !== 'incognito') {
      await checkAndCleanupEmptyConversation(currentConversationId);
    }
    set({ currentConversationId: id });
  },

  /**
   * 检查并删除没有消息的对话
   * @param {string} id - 待检查对话 ID
   * @returns {Promise<boolean>} 是否执行了清理
   */
  checkAndCleanupEmptyConversation: async (id) => {
    if (!id || id === 'incognito') return;
    try {
      const messageCount = await db.messages.where('conversationId').equals(id).count();
      if (messageCount === 0) {
        logger.info('useChatStore', 'Cleaning up empty conversation:', id);
        await db.conversations.delete(id);
        return true;
      }
    } catch (e) {
      logger.error('useChatStore', 'Failed to cleanup empty conversation:', e);
    }
    return false;
  },

  /**
   * 更新当前对话使用的模型配置
   * @param {object} model - 模型配置对象
   */
  setCurrentModel: (model) => set({ currentModel: model }),

  /**
   * 获取对话的运行时状态
   * @param {string} [conversationId] - 对话 ID
   * @returns {object} 运行时状态
   */
  getConversationState: (conversationId) => {
    const { conversationStates, currentConversationId } = get();
    const targetId = conversationId || currentConversationId;
    return conversationStates[targetId] || {
      isAIGenerating: false,
      streamingMessage: null,
      abortController: null,
      isReasoning: false,
      reasoningContent: '',
      reasoningStartTime: null,
      reasoningEndTime: null
    };
  },

  /**
   * 更新对话运行时状态
   * @param {string} conversationId - 对话 ID
   * @param {object} updates - 待更新字段
   */
  setConversationState: (conversationId, updates) => {
    set((state) => ({
      conversationStates: {
        ...state.conversationStates,
        [conversationId]: {
          ...(state.conversationStates[conversationId] || {}),
          ...updates
        }
      },
      ...(conversationId === state.currentConversationId ? {
        isAIGenerating: updates.isAIGenerating !== undefined ? updates.isAIGenerating : state.isAIGenerating,
        streamingMessage: updates.streamingMessage !== undefined ? updates.streamingMessage : state.streamingMessage,
        abortController: updates.abortController !== undefined ? updates.abortController : state.abortController,
        isReasoning: updates.isReasoning !== undefined ? updates.isReasoning : state.isReasoning,
        reasoningContent: updates.reasoningContent !== undefined ? updates.reasoningContent : state.reasoningContent
      } : {})
    }));
  },

  /**
   * 清除指定对话的状态信息
   * @param {string} conversationId - 对话 ID
   */
  clearConversationState: (conversationId) => {
    set((state) => {
      const newStates = { ...state.conversationStates };
      delete newStates[conversationId];
      return {
        conversationStates: newStates,
        ...(conversationId === state.currentConversationId ? {
          isAIGenerating: false,
          streamingMessage: null,
          abortController: null,
          isReasoning: false,
          reasoningContent: ''
        } : {})
      };
    });
  },

  /**
   * 更新 AI 深度思考状态
   * @param {boolean} isReasoning - 是否正在思考
   * @param {string} content - 思考内容
   */
  setReasoning: (isReasoning, content = '') => {
    const { currentConversationId } = get();
    if (currentConversationId) {
      get().setConversationState(currentConversationId, { isReasoning, reasoningContent: content });
    }
  },
  
  /**
   * 更新 AI 生成状态
   * @param {boolean} isGenerating - 是否正在生成
   */
  setAIGenerating: (isGenerating) => {
    const { currentConversationId } = get();
    if (currentConversationId) {
      get().setConversationState(currentConversationId, { isAIGenerating: isGenerating });
    }
  },

  /**
   * 设置当前流式输出的消息对象
   * @param {object} msg - 消息对象
   */
  setStreamingMessage: (msg) => {
    const { currentConversationId } = get();
    if (currentConversationId) {
      get().setConversationState(currentConversationId, { streamingMessage: msg });
    }
  },

  /**
   * 追加流式内容
   * @param {string} content - 新增文本块
   */
  updateStreamingContent: (content) => {
    const { currentConversationId, conversationStates } = get();
    if (!currentConversationId) return;
    
    const state = conversationStates[currentConversationId];
    const streamingMessage = state?.streamingMessage;
    
    if (streamingMessage) {
      get().setConversationState(currentConversationId, {
        streamingMessage: {
          ...streamingMessage,
          content: (streamingMessage.content || '') + content
        }
      });
    }
  },

  /**
   * 切换对话选中状态（批量操作用）
   * @param {string} id - 对话 ID
   */
  toggleConversationSelection: (id) => set((state) => ({
    selectedConversations: state.selectedConversations.includes(id)
      ? state.selectedConversations.filter(c => c !== id)
      : [...state.selectedConversations, id]
  })),

  /**
   * 清除所有对话选中状态
   */
  clearSelection: () => set({ selectedConversations: [] }),

  /**
   * 删除单个对话及其消息
   * @param {string} id - 对话 ID
   */
  deleteConversation: async (id) => {
    if (!id || id === 'incognito') return;
    
    try {
      const msgs = await db.messages.where('conversationId').equals(id).toArray();
      const messageIds = msgs.map(m => m.id);
      
      await recordDeletion('conversations', id);
      if (messageIds.length > 0) {
        await recordBatchDeletion('messages', messageIds);
      }

      await db.conversations.delete(id);
      await db.messages.where('conversationId').equals(id).delete();
      
      if (get().currentConversationId === id) {
        set({ currentConversationId: null });
      }
      
      syncService.debouncedSync();
      logger.info('useChatStore', 'Conversation deleted and sync triggered:', id);
    } catch (e) {
      logger.error('useChatStore', 'Failed to delete conversation:', e);
    }
  },

  /**
   * 批量删除已选中的对话
   */
  deleteBatchConversations: async () => {
    const { selectedConversations, currentConversationId } = get();
    if (selectedConversations.length === 0) return;

    const { t } = useI18nStore.getState();
    const confirmMessage = t('sidebar.deleteSelectedConfirm', { count: selectedConversations.length }) 
      || t('sidebar.deleteConversation');

    if (!confirm(confirmMessage)) return;
    
    const allMessageIds = [];
    for (const id of selectedConversations) {
      const msgs = await db.messages.where('conversationId').equals(id).toArray();
      allMessageIds.push(...msgs.map(m => m.id));
    }
    
    await recordBatchDeletion('conversations', selectedConversations);
    if (allMessageIds.length > 0) {
      await recordBatchDeletion('messages', allMessageIds);
    }

    for (const id of selectedConversations) {
      await db.conversations.delete(id);
      await db.messages.where('conversationId').equals(id).delete();
    }
    if (selectedConversations.includes(currentConversationId)) {
      set({ currentConversationId: null });
    }
    set({ selectedConversations: [] });
    syncService.debouncedSync();
  },

  /**
   * 清空所有历史对话
   */
  clearAllHistory: async () => {
    const { t } = useI18nStore.getState();
    if (confirm(t('sidebar.clearAllConfirm'))) {
      const allConvIds = (await db.conversations.toArray()).map(c => c.id);
      const allMsgIds = (await db.messages.toArray()).map(m => m.id);
      
      await recordBatchDeletion('conversations', allConvIds);
      await recordBatchDeletion('messages', allMsgIds);

      await db.conversations.clear();
      await db.messages.clear();
      set({ currentConversationId: null, selectedConversations: [] });
      syncService.debouncedSync();
    }
  },
  
  /**
   * 获取对话特定的本地设置
   * @param {string} conversationId - 对话 ID
   * @returns {Promise<object|null>} 配置对象
   */
  getConversationSettings: async (conversationId) => {
    if (!conversationId || conversationId === 'incognito') {
      const { pendingConversationSettings } = get();
      return pendingConversationSettings;
    }
    const conv = await db.conversations.get(conversationId);
    return conv?.localSettings || null;
  },
  
  /**
   * 更新对话特定的本地设置
   * @param {string} conversationId - 对话 ID
   * @param {object} settings - 设置项
   */
  updateConversationSettings: async (conversationId, settings) => {
    if (!conversationId || conversationId === 'incognito') {
      set({ pendingConversationSettings: settings });
      logger.info('useChatStore', 'Settings saved to pending:', settings);
      return;
    }
    await db.conversations.update(conversationId, { 
      localSettings: settings,
      lastUpdatedAt: Date.now() 
    });
    logger.info('useChatStore', 'Conversation settings updated:', { conversationId, settings });
  },
  
  /**
   * 重置对话设置为默认值
   * @param {string} conversationId - 对话 ID
   */
  resetConversationSettings: async (conversationId) => {
    if (!conversationId || conversationId === 'incognito') return;
    await db.conversations.update(conversationId, { 
      localSettings: null,
      lastUpdatedAt: Date.now() 
    });
    logger.info('useChatStore', 'Conversation settings reset:', conversationId);
  },

  /**
   * 创建新对话会话
   * @param {string} [title] - 对话标题
   * @returns {Promise<string>} 新创建的对话 ID
   */
  createNewConversation: async (title) => {
    const { currentConversationId, checkAndCleanupEmptyConversation } = get();
    
    if (currentConversationId && currentConversationId !== 'incognito') {
      await checkAndCleanupEmptyConversation(currentConversationId);
    }

    if (get().isIncognito) {
      set({ currentConversationId: 'incognito', incognitoMessages: [] });
      return 'incognito';
    }
    
    const defaultTitle = title || useI18nStore.getState().t('sidebar.newConversation');
    
    const { pendingConversationSettings } = get();
    
    const id = await db.conversations.add({
      title: defaultTitle,
      lastUpdatedAt: Date.now(),
      isIncognito: false,
      isGenerating: false,
      hasUnread: false,
      localSettings: pendingConversationSettings || null
    });
    
    if (pendingConversationSettings) {
      set({ pendingConversationSettings: null });
    }
    
    const { getEffectiveModel } = useConfigStore.getState();
    const defaultModel = getEffectiveModel('chat');
    if (defaultModel) {
      set({ 
        currentModel: { 
          providerId: defaultModel.providerId, 
          modelId: defaultModel.modelId 
        } 
      });
    }
    
    set({ currentConversationId: id });
    return id;
  },

  /**
   * AI 自动根据首条消息生成对话标题
   * @param {string} id - 对话 ID
   * @param {string} firstMessage - 首条消息内容
   * @param {object} config - 配置对象
   */
  autoRenameConversation: async (id, firstMessage, config) => {
    if (id === 'incognito') return;
    
    try {
      const conversation = await db.conversations.get(id);
      if (conversation?.manualTitle) {
        return;
      }

      // 对短对话启用绕过规则：如果首条消息少于 10 个字符，直接使用消息内容作为标题
      if (firstMessage && firstMessage.length < 10) {
        const cleanTitle = firstMessage.trim();
        if (cleanTitle) {
          const isCurrentConversation = get().currentConversationId === id;
          await db.conversations.update(id, { 
            title: cleanTitle,
            hasUnread: !isCurrentConversation
          });
          syncService.debouncedSync();
          return;
        }
      }

      const currentModel = get().currentModel;
      let effectiveModel = useConfigStore.getState().getEffectiveModel('naming', currentModel);
      
      if (!effectiveModel && config?.providers) {
        const activeProvider = config.providers.find(p => p.apiKey && p.models && p.models.length > 0);
        if (activeProvider) {
          const fallbackModel = activeProvider.models.find(m => m.selected) || activeProvider.models[0];
          if (fallbackModel) {
            effectiveModel = {
              providerId: activeProvider.id,
              modelId: fallbackModel.id,
              provider: activeProvider,
              source: 'manual-fallback'
            };
          }
        }
      }

      if (!effectiveModel) return;

      const { getAliyunRegionUrl } = await import('./useConfigStore');
      const actualBaseUrl = getAliyunRegionUrl(effectiveModel.provider);
      const { t } = useI18nStore.getState();
      const titleResponse = await chatCompletion({
        provider: effectiveModel.providerId,
        model: effectiveModel.modelId,
        apiKey: effectiveModel.provider.apiKey,
        baseUrl: actualBaseUrl,
        messages: [
          {
            role: 'system',
            content: t('chat.titleGeneratorPrompt')
          },
          {
            role: 'user',
            content: t('chat.titleGeneratorUser', { message: firstMessage })
          }
        ],
        proxyConfig: config.proxy || {},
        format: effectiveModel.provider.format || 'openai',
        options: { temperature: 0.5, max_tokens: 100 },
        stream: false
      });
      
      let title = '';
      if (typeof titleResponse === 'string') {
        title = titleResponse;
      } else if (titleResponse && typeof titleResponse === 'object') {
        title = titleResponse.content || titleResponse.text || '';
      }

      if (!title || typeof title !== 'string') return;

      let cleanTitle = title.replace(/["'「」]/g, '').trim();
      if (cleanTitle.length >= 30) cleanTitle = cleanTitle.substring(0, 30);
      
      const isCurrentConversation = get().currentConversationId === id;

      await db.conversations.update(id, { 
        title: cleanTitle,
        hasUnread: !isCurrentConversation
      });
      syncService.debouncedSync();
      
    } catch (e) {
      logger.error('useChatStore', 'Auto rename failed', e);
    }
  },

  /**
   * 获取当前对话路径下的有序消息序列
   * 遍历多分支树并根据选中标识仅返回当前选中的路径分支。
   * @param {string} conversationId - 对话 ID
   * @returns {Promise<Array>} 消息路径数组
   */
  getMessages: async (conversationId) => {
    try {
      const { isIncognito, incognitoMessages } = get();
      if (isIncognito || conversationId === 'incognito') {
        return incognitoMessages;
      }
      if (!conversationId) return [];

      const MESSAGE_FETCH_LIMIT = 5000;
      const allMessages = await db.messages
        .where('conversationId')
        .equals(conversationId)
        .limit(MESSAGE_FETCH_LIMIT)
        .sortBy('timestamp');
        
      if (!allMessages || allMessages.length === 0) return [];

      const msgMap = new Map();
      const childrenMap = new Map();
      
      const normalizeId = (id) => (id === undefined || id === null) ? 'root' : String(id);

      allMessages.forEach(m => {
        if (m && m.id !== undefined && m.id !== null) {
          const mid = normalizeId(m.id);
          msgMap.set(mid, m);
          
          const pid = normalizeId(m.parentId);
          if (!childrenMap.has(pid)) childrenMap.set(pid, []);
          childrenMap.get(pid).push(m);
        }
      });
      
      childrenMap.forEach(children => children.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0)));

      const path = [];
      
      let roots = childrenMap.get('root') || [];
      if (roots.length === 0) {
        const firstMsg = allMessages[0];
        if (firstMsg) {
          roots = [firstMsg];
        } else {
          return [];
        }
      }
      
      let currentMsg = roots[0];
      const visited = new Set();
      const MAX_ITERATIONS = 5000;
      let iterations = 0;
      
      while (currentMsg && iterations < MAX_ITERATIONS) {
         const currentMid = normalizeId(currentMsg.id);
         
         if (visited.has(currentMid)) break;
         visited.add(currentMid);
         iterations++;

         const pid = normalizeId(currentMsg.parentId);
         const siblings = childrenMap.get(pid) || [];
         
         path.push({
           ...currentMsg,
           siblingCount: siblings.length,
           siblingIndex: siblings.findIndex(m => normalizeId(m.id) === currentMid) + 1,
           siblings: siblings.map(s => s.id)
         });
         
         const children = childrenMap.get(currentMid);
         if (!children || children.length === 0) break;
         
         let nextId = currentMsg.selectedChildId;
         let nextMsg = nextId ? msgMap.get(normalizeId(nextId)) : null;
         
         if (!nextMsg || normalizeId(nextMsg.parentId) !== currentMid) {
           nextMsg = children[0];
         }
         currentMsg = nextMsg;
      }

      if (path.length > 200) {
        return path.slice(-200);
      }
      
      return path;
    } catch (error) {
      logger.error('useChatStore', 'Failed to get messages:', error);
      return [];
    }
  },

  /**
   * 追加新消息到消息树
   * @param {object} msg - 消息内容对象
   * @param {string} [conversationId] - 对话 ID
   * @param {string} [parentId] - 父消息 ID
   */
  addMessage: async (msg, conversationId = null, parentId = null) => {
    const { isIncognito, currentConversationId, incognitoMessages, getMessages } = get();
    const targetId = conversationId || currentConversationId;
    
    let finalParentId = parentId;
    
    if (!isIncognito && targetId !== 'incognito' && finalParentId === null) {
      const currentPath = await getMessages(targetId);
      if (currentPath.length > 0) {
        finalParentId = currentPath[currentPath.length - 1].id;
      } else {
        finalParentId = null;
      }
    }

    const newMsg = {
      ...msg,
      timestamp: Date.now(),
      conversationId: targetId,
      parentId: finalParentId,
      status: msg.status || 'completed',
      taskId: msg.taskId || null
    };

    if (isIncognito || targetId === 'incognito') {
      set({ incognitoMessages: [...incognitoMessages, newMsg] });
    } else if (targetId) {
      const id = await db.messages.add(newMsg);
      
      if (finalParentId) {
        await db.messages.update(finalParentId, { selectedChildId: id });
      }
      
      await db.conversations.update(targetId, { lastUpdatedAt: Date.now() });
      syncService.debouncedSync();
      return id;
    }
  },

  /**
   * 恢复中断中的 AI 生成任务
   */
  resumePendingTasks: async () => {
    const generatingMessages = await db.messages
      .where('status')
      .equals('generating')
      .toArray();

    if (generatingMessages.length === 0) return;

    logger.info('useChatStore', `Found ${generatingMessages.length} pending tasks to resume`);

    const { proxy } = useConfigStore.getState();

    for (const msg of generatingMessages) {
      if (!msg.taskId) {
        await get().updateMessageById(msg.id, { status: 'failed' });
        continue;
      }

      try {
        const taskData = await resumeTask(msg.taskId, proxy);
        
        if (taskData.status === 'completed' || taskData.status === 'failed') {
          await get().updateMessageById(msg.id, {
            content: taskData.content,
            status: taskData.status,
            error: taskData.error
          });
          
          await get().setConversationGenerating(msg.conversationId, false);

          if (msg.conversationId !== get().currentConversationId) {
            await get().markAsUnread(msg.conversationId);
          }
        } else if (taskData.status === 'generating') {
          await get().setConversationGenerating(msg.conversationId, true);

          await get().updateMessageById(msg.id, {
            content: taskData.content
          });
          setTimeout(() => get().resumePendingTasks(), 3000);
        }
      } catch (e) {
        logger.error('useChatStore', `Failed to resume task ${msg.taskId}:`, e);
      }
    }
  },

  /**
   * 在分支树节点中进行分支切换
   * @param {string} messageId - 消息 ID
   * @param {string} targetSiblingId - 目标兄弟节点 ID
   */
  switchBranch: async (messageId, targetSiblingId) => {
     const { isIncognito } = get();
     if (isIncognito) return;
     
     const msg = await db.messages.get(messageId);
     if (!msg || !msg.parentId) return;
     
     await db.messages.update(msg.parentId, { selectedChildId: targetSiblingId });
     await db.conversations.update(msg.conversationId, { lastUpdatedAt: Date.now() });
  },

  /**
   * 更新特定位置的消息内容
   * @param {string} conversationId - 对话 ID
   * @param {number} messageIndex - 消息在路径中的索引
   * @param {string} newContent - 新内容
   * @param {object} [extraFields] - 额外待更新字段
   */
  updateMessage: async (conversationId, messageIndex, newContent, extraFields = {}) => {
    const { isIncognito, incognitoMessages, getMessages } = get();
    
    if (isIncognito || conversationId === 'incognito') {
      const updatedMessages = [...incognitoMessages];
      if (updatedMessages[messageIndex]) {
        updatedMessages[messageIndex] = {
          ...updatedMessages[messageIndex],
          content: newContent,
          timestamp: Date.now(),
          ...extraFields
        };
        set({ incognitoMessages: updatedMessages });
      }
    } else {
      const path = await getMessages(conversationId);
      const msg = path[messageIndex];
      
      if (msg) {
        await db.messages.update(msg.id, {
          content: newContent,
          timestamp: Date.now(),
          ...extraFields
        });
        await db.conversations.update(conversationId, { lastUpdatedAt: Date.now() });
        syncService.debouncedSync();
      }
    }
  },

  /**
   * 通过消息 ID 直接更新消息内容
   * @param {string} messageId - 消息 ID
   * @param {object} updates - 更新对象
   */
  updateMessageById: async (messageId, updates) => {
    const { isIncognito, incognitoMessages } = get();
    
    if (isIncognito) {
      const index = incognitoMessages.findIndex(m => m.id === messageId);
      if (index !== -1) {
        const updatedMessages = [...incognitoMessages];
        updatedMessages[index] = { ...updatedMessages[index], ...updates };
        set({ incognitoMessages: updatedMessages });
      }
    } else {
      await db.messages.update(messageId, {
        ...updates
      });
      const msg = await db.messages.get(messageId);
      if (msg && msg.conversationId) {
        await db.conversations.update(msg.conversationId, { lastUpdatedAt: Date.now() });
      }
      syncService.debouncedSync();
    }
  },

  /**
   * 删除指定位置的消息
   * @param {string} conversationId - 对话 ID
   * @param {number} messageIndex - 消息在路径中的索引
   */
  deleteMessage: async (conversationId, messageIndex) => {
    const { isIncognito, incognitoMessages, getMessages } = get();
    
    if (isIncognito || conversationId === 'incognito') {
      const updatedMessages = incognitoMessages.filter((_, i) => i !== messageIndex);
      set({ incognitoMessages: updatedMessages });
    } else {
      const path = await getMessages(conversationId);
      const msg = path[messageIndex];
      
      if (msg) {
        await recordDeletion('messages', msg.id);

        await db.messages.delete(msg.id);
        
        if (msg.parentId) {
           const parent = await db.messages.get(msg.parentId);
           if (parent && parent.selectedChildId === msg.id) {
               await db.messages.update(msg.parentId, { selectedChildId: null });
           }
        }
        
        await db.conversations.update(conversationId, { lastUpdatedAt: Date.now() });
        syncService.debouncedSync();
      }
    }
  },

  /**
   * 设置对话是否正在进行 AI 生成
   * @param {string} id - 对话 ID
   * @param {boolean} isGenerating - 状态值
   */
  setConversationGenerating: async (id, isGenerating) => {
    if (id === 'incognito') return;
    try {
      await db.conversations.update(id, { isGenerating });
    } catch (e) {
      logger.error('useChatStore', 'Failed to set generating status:', e);
    }
  },

  /**
   * 强制停止 AI 生成并清理状态
   * @param {string} [conversationId] - 对话 ID
   */
  stopAIGeneration: async (conversationId = null) => {
    const { currentConversationId, conversationStates } = get();
    const targetId = conversationId || currentConversationId;
    
    if (!targetId) return;
    
    const state = conversationStates[targetId];
    const abortController = state?.abortController;
    
    if (abortController) {
      abortController.abort();
    }
    
    get().setConversationState(targetId, {
      abortController: null,
      isAIGenerating: false,
      streamingMessage: null,
      isReasoning: false,
      reasoningContent: ''
    });
    
    if (targetId !== 'incognito') {
      await db.conversations.update(targetId, { isGenerating: false });
    }
  },

  /**
   * 为对话配置终止控制器
   * @param {AbortController} controller - 控制器实例
   * @param {string} [conversationId] - 对话 ID
   */
  setAbortController: (controller, conversationId = null) => {
    const { currentConversationId } = get();
    const targetId = conversationId || currentConversationId;
    if (targetId) {
      get().setConversationState(targetId, { abortController: controller });
    }
  },

  /**
   * 清除终止控制器
   * @param {string} [conversationId] - 对话 ID
   */
  clearAbortController: (conversationId = null) => {
    const { currentConversationId } = get();
    const targetId = conversationId || currentConversationId;
    if (targetId) {
      get().setConversationState(targetId, { abortController: null });
    }
  },

  /**
   * 将对话标记为已读
   * @param {string} id - 对话 ID
   */
  markAsRead: async (id) => {
    if (id === 'incognito') return;
    try {
      await db.conversations.update(id, { hasUnread: false });
    } catch (e) {
      logger.error('useChatStore', 'Failed to mark as read:', e);
    }
  },

  /**
   * 将对话标记为未读（橙点提醒）
   * @param {string} id - 对话 ID
   */
  markAsUnread: async (id) => {
    if (id === 'incognito') return;
    try {
      await db.conversations.update(id, { hasUnread: true });
    } catch (e) {
      logger.error('useChatStore', 'Failed to mark as unread:', e);
    }
  },

  /**
   * 手动更新对话标题
   * @param {string} id - 对话 ID
   * @param {string} newTitle - 新标题
   */
  updateConversationTitle: async (id, newTitle) => {
    if (id === 'incognito' || !newTitle) return;
    try {
      await db.conversations.update(id, { 
        title: newTitle,
        manualTitle: true,
        lastUpdatedAt: Date.now()
      });
      syncService.debouncedSync();
    } catch (e) {
      logger.error('useChatStore', 'Failed to update conversation title:', e);
    }
  },

  /**
   * 对话摘要压缩：准备阶段
   * @param {string} conversationId - 对话 ID
   * @returns {Promise<object>} 待压缩内容信息
   */
  compressConversation: async (conversationId, options = {}) => {
    const { isIncognito, getMessages } = get();
    if (isIncognito || conversationId === 'incognito') {
      throw new Error('无法压缩隐身模式对话');
    }
    
    if (!conversationId) {
      throw new Error('未指定对话ID');
    }
    
    try {
      const messages = await getMessages(conversationId);
      if (messages.length === 0) {
        throw new Error('对话为空，无需压缩');
      }
      
      return {
        conversationId,
        messages,
        messageCount: messages.length
      };
    } catch (e) {
      logger.error('useChatStore', 'Failed to prepare compression:', e);
      throw e;
    }
  },

  /**
   * 对话摘要压缩：应用阶段
   * @param {string} conversationId - 对话 ID
   * @param {string} compressedContent - AI 生成的摘要内容
   * @param {Array} compressedMessageIds - 被压缩的消息 ID 列表
   */
  applyCompression: async (conversationId, compressedContent, compressedMessageIds) => {
    if (!conversationId || conversationId === 'incognito') {
      throw new Error('无法应用压缩到隐身模式对话');
    }
    
    try {
      await db.transaction('rw', db.messages, db.conversations, async () => {
        await db.messages.where('id').anyOf(compressedMessageIds).modify({ isCompressed: true });
        
        const messages = await db.messages
          .where('conversationId')
          .equals(conversationId)
          .sortBy('timestamp');
        
        const lastCompressedMsg = messages.find(m => 
          m.id === compressedMessageIds[compressedMessageIds.length - 1]
        );
        
        if (!lastCompressedMsg) {
          throw new Error('找不到最后一个被压缩的消息');
        }
        
        const existingSummary = await db.messages
          .where({ parentId: lastCompressedMsg.id, isCompressionSummary: true })
          .first();
        
        let summaryMsgId;
        if (existingSummary) {
          summaryMsgId = existingSummary.id;
          await db.messages.update(summaryMsgId, {
            content: compressedContent,
            timestamp: lastCompressedMsg.timestamp + 1
          });
        } else {
          summaryMsgId = await db.messages.add({
            conversationId,
            role: 'assistant',
            content: compressedContent,
            timestamp: lastCompressedMsg.timestamp + 1,
            parentId: lastCompressedMsg.id,
            isCompressed: false,
            isCompressionSummary: true
          });
        }
        
        await db.messages.update(lastCompressedMsg.id, {
          selectedChildId: summaryMsgId
        });
        
        const conv = await db.conversations.get(conversationId);
        const oldCompressedIds = conv?.compressionData?.compressedMessageIds || [];
        const combinedCompressedIds = Array.from(new Set([...oldCompressedIds, ...compressedMessageIds]));

        await db.conversations.update(conversationId, {
          compressionData: {
            summaryMessageId: summaryMsgId,
            compressedMessageIds: combinedCompressedIds,
            compressedContent,
            timestamp: Date.now()
          },
          lastUpdatedAt: Date.now()
        });
      });
      
      syncService.debouncedSync();
      return true;
    } catch (e) {
      logger.error('useChatStore', 'Failed to apply compression:', e);
      throw e;
    }
  },

  /**
   * 获取发送给 AI 的消息负载
   * 自动过滤已压缩消息并注入最新的摘要节点。
   * @param {string} conversationId - 对话 ID
   * @returns {Promise<Array>} 处理后的消息列表
   */
  getMessagesForAI: async (conversationId) => {
    try {
      const conversation = await db.conversations.get(conversationId);
      const messages = await db.messages
        .where('conversationId')
        .equals(conversationId)
        .sortBy('timestamp');
      
      if (!conversation?.compressionData) {
        return messages.filter(m => !m.isCompressed && !m.isCompressionSummary);
      }
      
      const { compressedContent, compressedMessageIds } = conversation.compressionData;
      
      const uncompressedMessages = messages.filter(
        m => !compressedMessageIds.includes(m.id) && !m.isCompressionSummary && !m.isCompressed
      );
      
      let virtualTimestamp = Date.now();
      if (compressedMessageIds.length > 0) {
        const firstCompressed = messages.find(m => m.id === compressedMessageIds[0]);
        if (firstCompressed) virtualTimestamp = firstCompressed.timestamp;
      }
      
      const virtualCompressedMessage = {
        role: 'assistant',
        content: compressedContent,
        timestamp: virtualTimestamp
      };
      
      return [virtualCompressedMessage, ...uncompressedMessages];
    } catch (e) {
      logger.error('useChatStore', 'Failed to get messages for AI:', e);
      throw e;
    }
  }
}));