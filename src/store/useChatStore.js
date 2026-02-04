import { create } from 'zustand';
import { db } from '../db';
import { chatCompletion, resumeTask } from '../services/aiService';
import { useConfigStore } from './useConfigStore';
import { logger } from '../services/logger';
import { syncService } from '../services/syncService';
import { useI18nStore } from '../i18n';

/**
 * 聊天业务 Store
 * 处理对话生命周期、消息树管理、AI 生成状态及自动命名等核心逻辑
 */
export const useChatStore = create((set, get) => ({
  // 基础状态
  currentConversationId: null,      // 当前激活的对话 ID
  isIncognito: false,               // 是否处于隐身模式（不持久化数据）
  incognitoMessages: [],            // 隐身模式下的临时消息列表
  currentModel: null,               // 当前选中的 AI 模型配置
  
  // 多对话并发状态管理（Key 为 conversationId）
  conversationStates: {}, 
  selectedConversations: [],        // 批量操作选中的对话 ID 列表
  
  // 对话创建前的预设配置
  pendingConversationSettings: null,
  
  // 废弃状态字段（仅用于向后兼容）
  isReasoning: false,
  reasoningContent: '',
  isAIGenerating: false,
  streamingMessage: null,
  abortController: null,

  /**
   * 切换隐身模式
   */
  setIncognito: (val) => set({ isIncognito: val, incognitoMessages: [] }),
  
  /**
   * 设置当前对话 ID
   */
  setCurrentConversation: (id) => set({ currentConversationId: id }),

  /**
   * 更新当前使用的模型
   */
  setCurrentModel: (model) => set({ currentModel: model }),

  /**
   * 获取指定对话的运行时状态
   * @param {string} conversationId 对话 ID，缺省为当前对话
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
   * 更新对话运行时状态并同步全局状态位
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

  // 清除指定对话的状态
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
   * 设置 AI 深度思考状态
   */
  setReasoning: (isReasoning, content = '') => {
    const { currentConversationId } = get();
    if (currentConversationId) {
      get().setConversationState(currentConversationId, { isReasoning, reasoningContent: content });
    }
  },
  
  /**
   * 设置 AI 正在回复状态
   */
  setAIGenerating: (isGenerating) => {
    const { currentConversationId } = get();
    if (currentConversationId) {
      get().setConversationState(currentConversationId, { isAIGenerating: isGenerating });
    }
  },

  /**
   * 设置当前流式输出的消息对象
   */
  setStreamingMessage: (msg) => {
    const { currentConversationId } = get();
    if (currentConversationId) {
      get().setConversationState(currentConversationId, { streamingMessage: msg });
    }
  },

  /**
   * 增量追加流式文本内容
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

  // 切换对话选中状态（批量操作）
  toggleConversationSelection: (id) => set((state) => ({
    selectedConversations: state.selectedConversations.includes(id)
      ? state.selectedConversations.filter(c => c !== id)
      : [...state.selectedConversations, id]
  })),

  // 清除选中的对话
  clearSelection: () => set({ selectedConversations: [] }),

  /**
   * 执行选定对话的批量删除
   */
  deleteBatchConversations: async () => {
    const { selectedConversations, currentConversationId } = get();
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
   * 危险操作：清空本地数据库中的所有对话与消息
   */
  clearAllHistory: async () => {
    const { t } = useI18nStore.getState();
    if (confirm(t('sidebar.clearAllConfirm'))) {
      await db.conversations.clear();
      await db.messages.clear();
      set({ currentConversationId: null, selectedConversations: [] });
      syncService.debouncedSync();
    }
  },
  
  /**
   * 读取对话特定的个性化配置（如 Temperature, 系统提示词等）
   */
  getConversationSettings: async (conversationId) => {
    if (!conversationId || conversationId === 'incognito') {
      const { pendingConversationSettings } = get();
      return pendingConversationSettings;
    }
    const conv = await db.conversations.get(conversationId);
    return conv?.localSettings || null;
  },
  
  // 更新对话的本地设置
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
  
  // 重置对话设置为默认值
  resetConversationSettings: async (conversationId) => {
    if (!conversationId || conversationId === 'incognito') return;
    await db.conversations.update(conversationId, { 
      localSettings: null,
      lastUpdatedAt: Date.now() 
    });
    logger.info('useChatStore', 'Conversation settings reset:', conversationId);
  },

  /**
   * 创建新会话并持久化
   * @param {string} title 对话初始标题
   */
  createNewConversation: async (title) => {
    if (get().isIncognito) {
      set({ currentConversationId: 'incognito', incognitoMessages: [] });
      return 'incognito';
    }
    
    // 使用翻译的默认标题
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
    
    set({ currentConversationId: id });
    syncService.debouncedSync();
    return id;
  },

  /**
   * AI 自动对话命名
   * 基于首条消息内容异步请求 AI 生成简短标题
   */
  autoRenameConversation: async (id, firstMessage, config) => {
    if (id === 'incognito') return;
    
    try {
      const conversation = await db.conversations.get(id);
      // 如果用户已经手动编辑过标题，则不再自动重命名
      if (conversation?.manualTitle) {
        logger.debug('useChatStore', 'Skipping auto-rename for manual title conversation:', id);
        return;
      }

      logger.debug('useChatStore', 'Starting background auto-rename task:', id);
      const currentModel = get().currentModel;
      let effectiveModel = useConfigStore.getState().getEffectiveModel('naming', currentModel);
      
      // 自动寻找可用模型进行命名请求
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

      // 发起非流式请求生成标题
      const titleResponse = await chatCompletion({
        provider: effectiveModel.providerId,
        model: effectiveModel.modelId,
        apiKey: effectiveModel.provider.apiKey,
        baseUrl: effectiveModel.provider.baseUrl,
        messages: [
          { 
            role: 'system', 
            content: '你是一个专业的对话命名助手。你的任务是阅读用户的输入，并生成一个简短、精准的标题（不超过10个字）。\n\n规则：\n1. 直接输出标题，不要包含任何标点符号、引号或解释性文字。\n2. 标题应概括对话的核心主题。\n3. 如果无法概括，请输出"新对话"。' 
          },
          { role: 'user', content: `用户输入：${firstMessage}\n\n请生成标题：` }
        ],
        proxyConfig: config.proxy || {},
        format: effectiveModel.provider.format || 'openai',
        options: { temperature: 0.5, max_tokens: 100 },
        stream: false
      });
      
      // 处理 Gemini 等模型返回的对象格式
      let title = '';
      if (typeof titleResponse === 'string') {
        title = titleResponse;
      } else if (titleResponse && typeof titleResponse === 'object') {
        // 兼容 aiService.js 中非流式请求可能返回的结果
        title = titleResponse.content || titleResponse.text || '';
      }

      if (!title || typeof title !== 'string') return;

      let cleanTitle = title.replace(/["'「」]/g, '').trim();
      if (cleanTitle.length >= 30) cleanTitle = cleanTitle.substring(0, 30);
      
      const isCurrentConversation = get().currentConversationId === id;

      await db.conversations.update(id, { 
        title: cleanTitle,
        // 如果不是当前正在查看的对话，标记为未读
        hasUnread: !isCurrentConversation
      });
      syncService.debouncedSync();
      
      logger.debug('useChatStore', `Conversation ${id} title updated, hasUnread: ${!isCurrentConversation}`);
      
    } catch (e) {
      logger.error('useChatStore', 'Auto rename failed', e);
    }
  },

  /**
   * 核心逻辑：获取当前路径下的消息序列
   * 遍历多分支消息树，仅返回当前被选中（selectedChildId 链接）的分支路径
   */
  getMessages: async (conversationId) => {
    try {
      const { isIncognito, incognitoMessages } = get();
      if (isIncognito || conversationId === 'incognito') {
        return incognitoMessages;
      }
      if (!conversationId) return [];

      // 获取当前对话的所有消息
      const allMessages = await db.messages
        .where('conversationId')
        .equals(conversationId)
        .sortBy('timestamp');
        
      if (!allMessages || allMessages.length === 0) return [];

      // 构建消息树的索引结构
      const msgMap = new Map();
      const childrenMap = new Map();

      allMessages.forEach(m => {
        if (m && m.id) {
          msgMap.set(m.id, m);
          const pid = m.parentId || 'root';
          if (!childrenMap.has(pid)) childrenMap.set(pid, []);
          childrenMap.get(pid).push(m);
        }
      });
      
      // 按时间戳排序子消息
      childrenMap.forEach(children => children.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0)));

      const path = [];
      
      // 从根节点开始遍历
      let roots = childrenMap.get('root') || [];
      if (roots.length === 0) return [];
      
      // 处理多根节点情况：选择第一个根节点
      let currentMsg = roots[0];
      const visited = new Set();
      const MAX_ITERATIONS = 5000; // 安全上限
      let iterations = 0;
      
      while (currentMsg && iterations < MAX_ITERATIONS) {
         // 循环检测
         if (visited.has(currentMsg.id)) {
           logger.error('useChatStore', 'Circular reference detected in message tree at ID:', currentMsg.id);
           break;
         }
         visited.add(currentMsg.id);
         iterations++;

         // 为消息添加兄弟节点信息
         const pid = currentMsg.parentId || 'root';
         const siblings = childrenMap.get(pid) || [];
         
         path.push({
           ...currentMsg,
           siblingCount: siblings.length,
           siblingIndex: siblings.findIndex(m => m.id === currentMsg.id) + 1,
           siblings: siblings.map(s => s.id)
         });
         
         const children = childrenMap.get(currentMsg.id);
         if (!children || children.length === 0) break;
         
         let nextId = currentMsg.selectedChildId;
         let nextMsg = nextId ? msgMap.get(nextId) : null;
         
         // 如果没有选中子节点或选中节点无效，默认选择最后一个子节点（最新分支）
         if (!nextMsg || nextMsg.parentId !== currentMsg.id) {
           nextMsg = children[children.length - 1];
         }
         currentMsg = nextMsg;
      }

      if (iterations >= MAX_ITERATIONS) {
        logger.error('useChatStore', 'Maximum message depth reached, possible infinite loop or extremely long conversation');
      }
      
      // 性能防御：如果消息过多，仅返回最近的 100 条。
      // 注意：由于是链表结构，这会从展示上切断历史，但能防止渲染挂掉。
      if (path.length > 100) {
        logger.warn('useChatStore', `Conversation ${conversationId} has ${path.length} messages, limiting UI to last 100`);
        return path.slice(-100);
      }
      
      return path;
    } catch (error) {
      logger.error('useChatStore', 'Failed to get messages:', error);
      return []; // 发生错误时返回空，防止 UI 崩溃
    }
  },

  /**
   * 在当前对话的分支末尾追加新消息
   */
  addMessage: async (msg, conversationId = null, parentId = null) => {
    const { isIncognito, currentConversationId, incognitoMessages, getMessages } = get();
    const targetId = conversationId || currentConversationId;
    
    // 确定父消息ID（如果未提供）
    let finalParentId = parentId;
    
    if (!isIncognito && targetId !== 'incognito' && finalParentId === null) {
      // 查找当前视图的叶子节点
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
      
      // 更新父消息的selectedChildId，自动切换到新分支
      if (finalParentId) {
        await db.messages.update(finalParentId, { selectedChildId: id });
      }
      
      await db.conversations.update(targetId, { lastUpdatedAt: Date.now() });
      syncService.debouncedSync();
      return id;
    }
  },

  /**
   * 恢复中断的任务
   * 扫描数据库中状态为 generating 的消息，并尝试从代理恢复
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
        // 如果没有 taskId，标记为失败（无法恢复）
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
          
          // 更新对话的生成状态
          await get().setConversationGenerating(msg.conversationId, false);

          // 如果生成结束且不在当前会话，标记未读（橙点）
          if (msg.conversationId !== get().currentConversationId) {
            await get().markAsUnread(msg.conversationId);
          }
        } else if (taskData.status === 'generating') {
          // 如果还在生成，确保对话处于正在生成状态（显示蓝点）
          await get().setConversationGenerating(msg.conversationId, true);

          // 更新内容并保持 generating 状态
          await get().updateMessageById(msg.id, {
            content: taskData.content
          });
          // 开启轮询（简单处理）
          setTimeout(() => get().resumePendingTasks(), 3000);
        }
      } catch (e) {
        logger.error('useChatStore', `Failed to resume task ${msg.taskId}:`, e);
      }
    }
  },

  /**
   * 切换消息树分支
   * 通过更新父节点的 selectedChildId 实现视图路径的切换
   */
  switchBranch: async (messageId, targetSiblingId) => {
     const { isIncognito } = get();
     if (isIncognito) return;
     
     const msg = await db.messages.get(messageId);
     if (!msg || !msg.parentId) return;
     
     // Update parent to point to the target sibling
     await db.messages.update(msg.parentId, { selectedChildId: targetSiblingId });
     
     // 触发UI更新（useLiveQuery会监听此变化）
     await db.conversations.update(msg.conversationId, { lastUpdatedAt: Date.now() });
  },

  // 更新消息内容（兼容消息树结构）
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
      // 使用路径索引查找消息ID
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

  // 通过ID直接更新消息
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
      // 获取消息所属的对话ID并更新
      const msg = await db.messages.get(messageId);
      if (msg && msg.conversationId) {
        await db.conversations.update(msg.conversationId, { lastUpdatedAt: Date.now() });
      }
      syncService.debouncedSync();
    }
  },

  // 删除消息
  deleteMessage: async (conversationId, messageIndex) => {
    const { isIncognito, incognitoMessages, getMessages } = get();
    
    if (isIncognito || conversationId === 'incognito') {
      const updatedMessages = incognitoMessages.filter((_, i) => i !== messageIndex);
      set({ incognitoMessages: updatedMessages });
    } else {
      const path = await getMessages(conversationId);
      const msg = path[messageIndex];
      
      if (msg) {
        // 删除消息树中的节点较为复杂，直接删除消息
        // 树遍历会处理缺失节点（中断链）
        await db.messages.delete(msg.id);
        
        // 清除父消息的引用关系
        if (msg.parentId) {
           const parent = await db.messages.get(msg.parentId);
           if (parent && parent.selectedChildId === msg.id) {
               // 取消选中状态，getMessages将自动选择默认子节点
               await db.messages.update(msg.parentId, { selectedChildId: null });
           }
        }
        
        await db.conversations.update(conversationId, { lastUpdatedAt: Date.now() });
        syncService.debouncedSync();
      }
    }
  },

  // 设置对话的生成状态
  setConversationGenerating: async (id, isGenerating) => {
    if (id === 'incognito') return;
    try {
      await db.conversations.update(id, { isGenerating });
      logger.debug('useChatStore', `Conversation ${id} generating status set to:`, isGenerating);
    } catch (e) {
      logger.error('useChatStore', 'Failed to set generating status:', e);
    }
  },

  /**
   * 强制终止 AI 响应生成
   * 发送 Abort 信号并清理运行时状态
   */
  stopAIGeneration: async (conversationId = null) => {
    const { currentConversationId, conversationStates } = get();
    const targetId = conversationId || currentConversationId;
    
    if (!targetId) {
      logger.warn('useChatStore', 'Cannot stop: No conversation ID specified');
      return;
    }
    
    const state = conversationStates[targetId];
    const abortController = state?.abortController;
    
    if (abortController) {
      logger.info('useChatStore', 'Stopping AI generation...', { conversationId: targetId });
      abortController.abort();
    }
    
    // 无论 abortController 是否存在，都强制重置状态，防止 UI 卡死
    get().setConversationState(targetId, {
      abortController: null,
      isAIGenerating: false,
      streamingMessage: null,
      isReasoning: false,
      reasoningContent: ''
    });
    
    // 同步更新数据库状态
    if (targetId !== 'incognito') {
      await db.conversations.update(targetId, { isGenerating: false });
    }
    
    logger.info('useChatStore', 'AI generation stopped and state reset', { conversationId: targetId });
  },

  // 设置取消控制器
  setAbortController: (controller, conversationId = null) => {
    const { currentConversationId } = get();
    const targetId = conversationId || currentConversationId;
    if (targetId) {
      get().setConversationState(targetId, { abortController: controller });
      logger.debug('useChatStore', 'AbortController set', { conversationId: targetId });
    }
  },

  // 清除取消控制器
  clearAbortController: (conversationId = null) => {
    const { currentConversationId } = get();
    const targetId = conversationId || currentConversationId;
    if (targetId) {
      get().setConversationState(targetId, { abortController: null });
      logger.debug('useChatStore', 'AbortController cleared', { conversationId: targetId });
    }
  },

  // 标记对话为已读
  markAsRead: async (id) => {
    if (id === 'incognito') return;
    try {
      await db.conversations.update(id, { hasUnread: false });
      logger.debug('useChatStore', `Conversation ${id} marked as read`);
    } catch (e) {
      logger.error('useChatStore', 'Failed to mark as read:', e);
    }
  },

  // 标记对话为未读
  markAsUnread: async (id) => {
    if (id === 'incognito') return;
    try {
      await db.conversations.update(id, { hasUnread: true });
      logger.debug('useChatStore', `Conversation ${id} marked as unread`);
    } catch (e) {
      logger.error('useChatStore', 'Failed to mark as unread:', e);
    }
  },

  // 更新对话标题
  updateConversationTitle: async (id, newTitle) => {
    if (id === 'incognito' || !newTitle) return;
    try {
      await db.conversations.update(id, { 
        title: newTitle,
        manualTitle: true,
        lastUpdatedAt: Date.now()
      });
      syncService.debouncedSync();
      logger.info('useChatStore', 'Conversation title updated manually:', { id, newTitle });
    } catch (e) {
      logger.error('useChatStore', 'Failed to update conversation title:', e);
    }
  },

  /**
   * 对话压缩准备
   * 收集需要发送给 AI 进行摘要压缩的消息上下文
   */
  compressConversation: async (conversationId, options = {}) => {
    const { isIncognito, getMessages } = get();
    if (isIncognito || conversationId === 'incognito') {
      throw new Error('无法压缩隐身模式对话');
    }
    
    if (!conversationId) {
      throw new Error('未指定对话ID');
    }
    
    logger.info('useChatStore', 'Starting manual compression for conversation:', conversationId);
    
    try {
      // 获取对话的所有消息
      const messages = await getMessages(conversationId);
      
      if (messages.length === 0) {
        throw new Error('对话为空，无需压缩');
      }
      
      // 返回消息列表和元数据，由调用者执行压缩
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
   * 应用压缩结果
   * 在消息树中插入特殊的摘要节点，并将选定消息标记为“已压缩”以节省 Token
   */
  applyCompression: async (conversationId, compressedContent, compressedMessageIds) => {
    if (!conversationId || conversationId === 'incognito') {
      throw new Error('无法应用压缩到隐身模式对话');
    }
    
    try {
      logger.info('useChatStore', 'Applying compression:', {
        conversationId,
        compressedCount: compressedMessageIds.length
      });
      
      // 1. 使用事务确保操作原子性
      await db.transaction('rw', db.messages, db.conversations, async () => {
        // 标记消息为已压缩（不删除）
        await db.messages.where('id').anyOf(compressedMessageIds).modify({ isCompressed: true });
        
        // 获取所有消息，找到最后一个被压缩的消息
        const messages = await db.messages
          .where('conversationId')
          .equals(conversationId)
          .sortBy('timestamp');
        
        // 找到最后一个被压缩的消息
        const lastCompressedMsg = messages.find(m => 
          m.id === compressedMessageIds[compressedMessageIds.length - 1]
        );
        
        if (!lastCompressedMsg) {
          throw new Error('找不到最后一个被压缩的消息');
        }
        
        // 2. 检查是否已经存在该父节点的摘要消息，避免重复创建
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
          // 插入压缩摘要消息，作为最后一个被压缩消息的子节点
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
        
        // 更新最后一个被压缩消息的selectedChildId指向摘要
        await db.messages.update(lastCompressedMsg.id, {
          selectedChildId: summaryMsgId
        });
        
        // 3. 维护压缩历史，支持多次压缩
        const conv = await db.conversations.get(conversationId);
        const oldCompressedIds = conv?.compressionData?.compressedMessageIds || [];
        const combinedCompressedIds = Array.from(new Set([...oldCompressedIds, ...compressedMessageIds]));

        // 保存压缩数据到对话
        await db.conversations.update(conversationId, {
          compressionData: {
            summaryMessageId: summaryMsgId,
            compressedMessageIds: combinedCompressedIds,
            compressedContent, // 记录最近一次的摘要
            timestamp: Date.now()
          },
          lastUpdatedAt: Date.now()
        });
      });
      
      logger.info('useChatStore', 'Compression applied successfully');
      syncService.debouncedSync();
      return true;
    } catch (e) {
      logger.error('useChatStore', 'Failed to apply compression:', e);
      throw e;
    }
  },

  /**
   * 构建发送给 AI 的 Payload
   * 自动整合已压缩的摘要内容与最新的未压缩消息，平衡上下文长度与 Token 消耗
   */
  getMessagesForAI: async (conversationId) => {
    try {
      const conversation = await db.conversations.get(conversationId);
      const messages = await db.messages
        .where('conversationId')
        .equals(conversationId)
        .sortBy('timestamp');
      
      // 如果没有压缩数据，返回所有未压缩的消息
      if (!conversation?.compressionData) {
        return messages.filter(m => !m.isCompressed && !m.isCompressionSummary);
      }
      
      const { compressedContent, compressedMessageIds } = conversation.compressionData;
      
      // 过滤掉已压缩的消息和压缩摘要消息
      const uncompressedMessages = messages.filter(
        m => !compressedMessageIds.includes(m.id) && !m.isCompressionSummary && !m.isCompressed
      );
      
      // 找到压缩消息中最早的一个时间戳作为虚拟消息的时间戳
      let virtualTimestamp = Date.now();
      if (compressedMessageIds.length > 0) {
        const firstCompressed = messages.find(m => m.id === compressedMessageIds[0]);
        if (firstCompressed) virtualTimestamp = firstCompressed.timestamp;
      }
      
      // 构造虚拟压缩消息
      const virtualCompressedMessage = {
        role: 'assistant',
        content: compressedContent,
        timestamp: virtualTimestamp
      };
      
      // 合并：压缩内容 + 未压缩的消息
      return [virtualCompressedMessage, ...uncompressedMessages];
    } catch (e) {
      logger.error('useChatStore', 'Failed to get messages for AI:', e);
      throw e;
    }
  }
}));
