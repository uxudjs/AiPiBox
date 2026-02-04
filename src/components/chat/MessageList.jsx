import React, { useRef, useEffect, useState, useCallback, useLayoutEffect, useMemo } from 'react';
import { useChatStore } from '../../store/useChatStore';
import { useConfigStore } from '../../store/useConfigStore';
import { useFileStore } from '../../store/useFileStore';
import { useKnowledgeBaseStore } from '../../store/useKnowledgeBaseStore';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import { cn } from '../../utils/cn';
import { shallow } from 'zustand/shallow';
import { User, Bot, Copy, RotateCcw, Edit2, Quote, Brain, ChevronDown, ChevronUp, Loader2, Check, X, Save, ChevronLeft, ChevronRight, Send, FileText } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';
import { chatCompletion } from '../../services/aiService';
import { logger } from '../../services/logger';
import { useTranslation } from '../../i18n';

/**
 * 推理过程展示组件
 * 用于渲染 AI 的深度思考逻辑，支持计时显示与折叠交互
 */
const ReasoningBlock = ({ content, isActive = false, model = null, tokens = null, time = null, startTime = null }) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [elapsedTime, setElapsedTime] = React.useState(0);
  
  // 实时计时逻辑：思考过程中动态显示耗时
  useEffect(() => {
    if (isActive && startTime) {
      // 思考中：每100ms更新一次耗时
      const timer = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        setElapsedTime(parseFloat(elapsed.toFixed(1)));
      }, 100);
      
      return () => clearInterval(timer);
    } else if (time) {
      // 思考完成：显示最终时间
      setElapsedTime(parseFloat(parseFloat(time).toFixed(1)));
    }
  }, [isActive, startTime, time]);
  
  // 格式化显示时间为字符串
  const displayTime = isActive && !time ? `${elapsedTime.toFixed(1)}s` : (time ? `${parseFloat(time).toFixed(1)}s` : null);
  
  return (
    <div className="w-full rounded-lg border border-border/30 bg-card/50 overflow-hidden mb-2">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-2.5 flex items-center justify-between text-xs hover:bg-accent/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <Brain className={cn("w-3 h-3 text-yellow-500", isActive && "animate-pulse")} />
          </div>
          <span className="font-medium">{t('message.reasoning')}</span>
          {displayTime && (
            <span className="text-muted-foreground">
              ({displayTime})
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(content);
            }}
            className="p-1 hover:bg-accent/50 rounded transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 text-xs text-muted-foreground border-t border-border/30 whitespace-pre-wrap leading-relaxed">
          {content}
        </div>
      )}
    </div>
  );
};

/**
 * 单条消息渲染单元
 * 封装了消息显示、编辑模式切换、分支导航及工具栏交互
 */
const MessageItem = React.memo(({ 
  msg, 
  index, 
  isEditing, 
  editContent, 
  onEditContentChange, 
  onSaveEdit, 
  onSaveAndSend,
  onCancelEdit, 
  onStartEdit, 
  onCopy, 
  onQuote, 
  onRegenerate,
  onSwitchBranch,
  copySuccessIndex,
  isGenerating,
  getModelDisplayName,
  // 实时生成相关的属性
  isMsgGenerating = false,
  reasoningContent = null,
  reasoningStartTime = null,
  isReasoning = false,
  reasoningEndTime = null
}) => {
  const { t } = useTranslation();
  // 聚合推理内容：优先使用实时生成的内容
  const displayReasoning = isMsgGenerating ? (reasoningContent || msg.reasoning) : msg.reasoning;

  return (
    <div className="flex gap-3 max-w-5xl mx-auto w-full mb-6">
      {/* 消息发送者头像 */}
      <div className={cn(
        "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
        msg.role === 'user' ? "bg-muted" : "bg-blue-500"
      )}>
        {msg.role === 'user' ? (
          <User className="w-5 h-5 text-muted-foreground" />
        ) : (
          <Bot className="w-5 h-5 text-white" />
        )}
      </div>
      
      {/* 消息正文内容区域 */}
      <div className="flex-1 min-w-0">
        {msg.role === 'user' ? (
          /* 用户消息显示和编辑 */
          isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => onEditContentChange(e.target.value)}
                className="w-full min-h-[100px] p-3 rounded-lg border border-border bg-card text-sm resize-y focus:ring-2 focus:ring-primary"
                autoFocus
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSaveEdit(index)}
                  className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium flex items-center gap-1 hover:opacity-90 transition-opacity"
                >
                  <Save className="w-3 h-3" />
                  {t('common.save')}
                </button>
                <button
                  onClick={() => onSaveAndSend(index)}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium flex items-center gap-1 hover:bg-opacity-90 transition-opacity"
                >
                  <Send className="w-3 h-3" />
                  {t('conversationSettings.saveAndSend')}
                </button>
                <button
                  onClick={onCancelEdit}
                  className="px-3 py-1.5 bg-accent text-foreground rounded-lg text-xs font-medium flex items-center gap-1 hover:bg-accent/80 transition-colors"
                >
                  <X className="w-3 h-3" />
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="inline-block px-4 py-2.5 rounded-2xl bg-muted max-w-[80%]">
                <div className="text-sm leading-relaxed">
                  <MarkdownRenderer content={msg.content} />
                  {/* 文件附件显示 */}
                  {msg.files && msg.files.length > 0 && (
                    <div className="flex gap-2 mt-2 overflow-x-auto custom-scrollbar pb-1 max-w-full">
                      {msg.files.map((file) => (
                        <div key={file.id} className="flex items-center gap-2 bg-background/50 rounded-lg p-2 pr-3 min-w-[140px] max-w-[200px] border border-border/10 flex-shrink-0">
                          <div className="w-8 h-8 flex items-center justify-center bg-background rounded shrink-0">
                            <FileText className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-medium truncate w-full" title={file.name}>{file.name}</span>
                            <span className="text-[10px] text-muted-foreground truncate">{file.size ? `${(file.size / 1024).toFixed(1)} KB` : 'File'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        ) : (
          /* AI回复消息 */
          <div className="space-y-2">
            {/* AI深度思考过程展示 */}
            {displayReasoning && (
              <ReasoningBlock 
                content={displayReasoning} 
                model={msg.model} 
                time={msg.thinkingTime}
                isActive={isMsgGenerating && isReasoning && !reasoningEndTime}
                startTime={isMsgGenerating ? reasoningStartTime : null}
              />
            )}
                        
            {/* AI消息编辑模式 */}
            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={editContent}
                  onChange={(e) => onEditContentChange(e.target.value)}
                  className="w-full min-h-[100px] p-3 rounded-lg border border-border bg-card text-sm resize-y focus:ring-2 focus:ring-primary"
                  autoFocus
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSaveEdit(index)}
                    className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium flex items-center gap-1 hover:opacity-90 transition-opacity"
                  >
                    <Save className="w-3 h-3" />
                    {t('common.save')}
                  </button>
                  <button
                    onClick={onCancelEdit}
                    className="px-3 py-1.5 bg-accent text-foreground rounded-lg text-xs font-medium flex items-center gap-1 hover:bg-accent/80 transition-colors"
                  >
                    <X className="w-3 h-3" />
                    {t('common.cancel')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-sm leading-relaxed">
                <MarkdownRenderer content={msg.content} isGenerating={isMsgGenerating} />
              </div>
            )}
            
            {/* 消息操作按钮组 - 压缩摘要不显示操作按钮 */}
            {!msg.isCompressionSummary && (
              <div className="flex items-center gap-1 mt-2 opacity-60 hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => onCopy(msg.content, index)} 
                  className="p-1.5 hover:bg-accent rounded-full transition-colors" 
                  title={t('message.copy')}
                >
                  {copySuccessIndex === index ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <button 
                  onClick={() => onRegenerate(index)}
                  disabled={isGenerating}
                  className="p-1.5 hover:bg-accent rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed" 
                  title={t('message.regenerate')}
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => onStartEdit(index, msg.content)}
                  disabled={isEditing}
                  className="p-1.5 hover:bg-accent rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed" 
                  title={t('message.edit')}
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                {/* 多分支消息切换控件 */}
                {msg.siblingCount > 1 && (
                  <div className="flex items-center gap-1 ml-1 bg-accent/30 rounded-lg px-1">
                    <button 
                      onClick={() => onSwitchBranch(msg, 'prev')}
                      disabled={msg.siblingIndex <= 1}
                      className="p-1 hover:bg-accent rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title={t('message.prevBranch')}
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-medium min-w-[24px] text-center select-none">
                      {msg.siblingIndex}/{msg.siblingCount}
                    </span>
                    <button 
                      onClick={() => onSwitchBranch(msg, 'next')}
                      disabled={msg.siblingIndex >= msg.siblingCount}
                      className="p-1 hover:bg-accent rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title={t('message.nextBranch')}
                    >
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* 用户消息操作按钮组 */}
        {msg.role === 'user' && !isEditing && (
          <div className="flex items-center gap-1 mt-2 opacity-60 hover:opacity-100 transition-opacity">
            <button 
              onClick={() => onCopy(msg.content, index)} 
              className="p-1.5 hover:bg-accent rounded-full transition-colors" 
              title={t('message.copy')}
            >
              {copySuccessIndex === index ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
            <button 
              onClick={() => onStartEdit(index, msg.content)}
              disabled={isEditing}
              className="p-1.5 hover:bg-accent rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed" 
              title={t('message.edit')}
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onQuote(msg.content)}
              className="p-1.5 hover:bg-accent rounded-full transition-colors" 
              title={t('message.quote')}
            >
              <Quote className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

/**
 * 消息流容器组件
 * 负责监听 IndexedDB 数据变更、驱动滚动逻辑并协调流式响应的展示过程
 */
const MessageList = () => {
  const { t } = useTranslation();
  // 从状态管理中获取操作函数
  const { 
    addMessage,
    getMessages,
    updateMessage,
    updateMessageById,
    setStreamingMessage,
    setAIGenerating,
    setReasoning,
    setConversationState,
    switchBranch,
    setConversationGenerating,
    markAsUnread,
    getConversationSettings
  } = useChatStore(
    (state) => ({
      addMessage: state.addMessage,
      getMessages: state.getMessages,
      updateMessage: state.updateMessage,
      updateMessageById: state.updateMessageById,
      setStreamingMessage: state.setStreamingMessage,
      setAIGenerating: state.setAIGenerating,
      setReasoning: state.setReasoning,
      setConversationState: state.setConversationState,
      switchBranch: state.switchBranch,
      setConversationGenerating: state.setConversationGenerating,
      markAsUnread: state.markAsUnread,
      getConversationSettings: state.getConversationSettings
    }),
    shallow
  );

  // 订阅状态变化
  const currentConversationId = useChatStore(state => state.currentConversationId);
  const isIncognito = useChatStore(state => state.isIncognito);
  const incognitoMessages = useChatStore(state => state.incognitoMessages);
  const currentModel = useChatStore(state => state.currentModel);

  // 精准订阅当前对话的生成状态
  const { 
    isAIGenerating, 
    streamingMessage, 
    isReasoning, 
    reasoningContent, 
    reasoningStartTime,
    reasoningEndTime
  } = useChatStore(state => {
    const id = state.currentConversationId;
    return state.conversationStates[id] || {
      isAIGenerating: false,
      streamingMessage: null,
      isReasoning: false,
      reasoningContent: '',
      reasoningStartTime: null,
      reasoningEndTime: null
    };
  }, shallow);

  const [localSettings, setLocalSettings] = useState(null);
  const { providers, proxy, conversationPresets, defaultModels } = useConfigStore();
  const scrollRef = useRef(null);
  const [editingMessageIndex, setEditingMessageIndex] = React.useState(null);
  const [editContent, setEditContent] = React.useState('');
  const [copySuccessIndex, setCopySuccessIndex] = React.useState(null);
  const [shouldAutoScroll, setShouldAutoScroll] = React.useState(true);
  
  // 使用 useMemo 缓存模型名称映射表，避免在渲染循环中进行查找
  const modelNameMap = useMemo(() => {
    const map = {};
    providers.forEach(p => {
      p.models?.forEach(m => {
        if (m.id && m.name) map[m.id] = m.name;
      });
    });
    return map;
  }, [providers]);

  // 获取模型显示名称的辅助函数
  const getModelDisplayName = useCallback((modelId) => {
    return modelNameMap[modelId] || modelId;
  }, [modelNameMap]);

  // 使用useLiveQuery监听数据库变化，自动更新消息列表
  const messages = useLiveQuery(
    async () => {
        if (!currentConversationId) return [];
        return await getMessages(currentConversationId);
    },
    [currentConversationId, getMessages]
  ) || (isIncognito ? incognitoMessages : []);

  // 使用 useLiveQuery 监听对话设置更新，替代 setInterval 轮询
  const dbSettings = useLiveQuery(
    async () => {
      if (!currentConversationId || currentConversationId === 'incognito') return null;
      const conv = await db.conversations.get(currentConversationId);
      return conv?.localSettings || null;
    },
    [currentConversationId]
  );

  // 监听设置更新
  useEffect(() => {
    const globalDisplay = useConfigStore.getState().conversationSettings.display;
    
    // 合并逻辑：如果对话设置中为 null，则回退到全局设置
    const merged = {
      showWordCount: (dbSettings?.showWordCount !== null && dbSettings?.showWordCount !== undefined) 
        ? dbSettings.showWordCount 
        : globalDisplay.showWordCount,
      showTokenUsage: (dbSettings?.showTokenUsage !== null && dbSettings?.showTokenUsage !== undefined)
        ? dbSettings.showTokenUsage
        : globalDisplay.showTokenCount,
      showModelName: (dbSettings?.showModelName !== null && dbSettings?.showModelName !== undefined)
        ? dbSettings.showModelName
        : globalDisplay.showModelName
    };
    
    setLocalSettings(merged);
  }, [dbSettings, currentConversationId]);

  // 切换对话时重置自动滚动状态
  useEffect(() => {
    setShouldAutoScroll(true);
  }, [currentConversationId]);
  
  // 监听滚动事件：用户手动滚动时禁用自动滚动
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShouldAutoScroll(prev => {
        if (prev !== isAtBottom) return isAtBottom;
        return prev;
    });
  }, []);

  /**
   * 滚动控制：布局变更响应
   * 当消息长度或思考状态改变时，若处于自动滚动模式，强制同步滚动位置
   */
  useLayoutEffect(() => {
    if (scrollRef.current && shouldAutoScroll) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, !!streamingMessage, !!reasoningContent, shouldAutoScroll]);

  /**
   * 滚动控制：流式输出追踪
   * 针对文本增量追加过程，利用 requestAnimationFrame 优化滚动平滑度，避免掉帧
   */
  useEffect(() => {
    if (scrollRef.current && shouldAutoScroll && (streamingMessage?.content || reasoningContent)) {
       const scrollContainer = scrollRef.current;
       requestAnimationFrame(() => {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
       });
    }
  }, [streamingMessage?.content, reasoningContent, shouldAutoScroll]);

  // 复制消息内容
  const copyMessage = useCallback((content, index) => {
    navigator.clipboard.writeText(content)
      .then(() => {
        setCopySuccessIndex(index);
        setTimeout(() => setCopySuccessIndex(null), 2000);
      })
      .catch((err) => {
        logger.error('MessageList', 'Copy failed:', err);
      });
  }, []);
  
  // 引用消息
  const quoteMessage = useCallback((content) => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      const quotedText = `> ${content.split('\n').join('\n> ')}\n\n`;
      textarea.value = quotedText + textarea.value;
      textarea.focus();
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }, []);
  
  // 编辑消息
  const startEditMessage = useCallback((index, content) => {
    setEditingMessageIndex(index);
    // 如果内容是数组（包含图片等），提取文本部分进行编辑
    if (Array.isArray(content)) {
      const textPart = content.find(c => c.type === 'text');
      setEditContent(textPart ? textPart.text : '');
    } else {
      setEditContent(content);
    }
  }, []);
  
  const cancelEdit = useCallback(() => {
    setEditingMessageIndex(null);
    setEditContent('');
  }, []);
  
  const saveEdit = useCallback(async (index) => {
    if (!editContent.trim()) return;
    try {
      // 检查原始内容是否为数组，如果是，则只更新文本部分，保留图片和其他信息
      const originalMsg = messages[index];
      let newContent = editContent;
      
      if (originalMsg && Array.isArray(originalMsg.content)) {
        newContent = originalMsg.content.map(part => {
          if (part.type === 'text') {
            return { ...part, text: editContent };
          }
          return part;
        });
        
        // 如果原数组中没有文本部分，添加一个
        if (!newContent.find(p => p.type === 'text')) {
          newContent.unshift({ type: 'text', text: editContent });
        }
      }
      
      await updateMessage(currentConversationId, index, newContent);
      setEditingMessageIndex(null);
      setEditContent('');
    } catch (error) {
      logger.error('MessageList', 'Save edit failed:', error);
    }
  }, [editContent, currentConversationId, updateMessage, messages]);

  // 保存并发送
  const saveAndSend = useCallback(async (index) => {
    if (!editContent.trim()) return;
    try {
      // 检查原始内容是否为数组，如果是，则只更新文本部分
      const originalMsg = messages[index];
      let newContent = editContent;
      
      if (originalMsg && Array.isArray(originalMsg.content)) {
        newContent = originalMsg.content.map(part => {
          if (part.type === 'text') {
            return { ...part, text: editContent };
          }
          return part;
        });
        
        if (!newContent.find(p => p.type === 'text')) {
          newContent.unshift({ type: 'text', text: editContent });
        }
      }

      await updateMessage(currentConversationId, index, newContent);
      setEditingMessageIndex(null);
      setEditContent('');
      
      const currentUserMsg = messages[index];
      if (!currentUserMsg) return;

      const localSettingsData = await getConversationSettings(currentConversationId);
      const effectivePresets = { ...conversationPresets };
      if (localSettingsData) {
        if (localSettingsData.systemPrompt !== null) effectivePresets.systemPrompt = localSettingsData.systemPrompt;
        if (localSettingsData.contextLimit !== null) effectivePresets.contextLimit = localSettingsData.contextLimit;
        if (localSettingsData.temperature !== null) effectivePresets.temperature = localSettingsData.temperature;
        if (localSettingsData.topP !== null) effectivePresets.topP = localSettingsData.topP;
        if (localSettingsData.topK !== null) effectivePresets.topK = localSettingsData.topK;
        if (localSettingsData.frequencyPenalty !== null) effectivePresets.frequencyPenalty = localSettingsData.frequencyPenalty;
        if (localSettingsData.presencePenalty !== null) effectivePresets.presencePenalty = localSettingsData.presencePenalty;
        if (localSettingsData.maxTokens !== null) effectivePresets.maxTokens = localSettingsData.maxTokens;
      }
      
      const prevMessages = messages.slice(0, index).map(m => ({
        role: m.role,
        content: m.content,
        ...(m.ocrContent ? { ocrContent: m.ocrContent } : {})
      }));
      
      const contextMessages = [
        ...prevMessages,
        { role: 'user', content: editContent }
      ];
      
      let messagesList = contextMessages.filter(m => m.role !== 'system');
      if (effectivePresets.contextLimit !== null && effectivePresets.contextLimit > 0) {
        if (messagesList.length > effectivePresets.contextLimit) {
          messagesList = messagesList.slice(-effectivePresets.contextLimit);
        }
      }
      
      // 构建完整的系统消息（包含用户提示词和语言要求）
      const systemParts = [];
      
      // 1. 用户自定义的系统提示词（或默认提示词）
      if (effectivePresets.systemPrompt && effectivePresets.systemPrompt.trim()) {
        systemParts.push(effectivePresets.systemPrompt.trim());
      } else {
        // 如果用户没有配置系统提示词，使用翻译的默认提示词
        const defaultPrompt = t('settings.conversation.promptPlaceholder');
        systemParts.push(defaultPrompt);
      }

      // 1.1 添加已上传的文档内容
      const documentsContent = useFileStore.getState().getCompletedFilesContent(currentConversationId);
      if (documentsContent) {
        systemParts.push('\n\n--- Uploaded Document Content ---\n' + documentsContent);
        logger.info('MessageList.saveAndSend', 'Added document content to system message');
      }
      
      // 1.2 添加知识库检索的相关文档
      const { activeKnowledgeBase, retrieveDocuments } = useKnowledgeBaseStore.getState();
      if (activeKnowledgeBase) {
        logger.info('MessageList.saveAndSend', 'Knowledge base active, retrieving documents...');
        const retrievedDocs = retrieveDocuments(editContent, activeKnowledgeBase);
        
        if (retrievedDocs.length > 0) {
          const kbContext = retrievedDocs.map((doc, idx) => 
            `[Document ${idx + 1}] ${doc.documentName}\n${doc.content}\nSimilarity: ${(doc.similarity * 100).toFixed(1)}%`
          ).join('\n\n');
          
          systemParts.push('\n\n--- Knowledge Base Documents ---\n' + kbContext);
          logger.info('MessageList.saveAndSend', `Retrieved ${retrievedDocs.length} documents from KB`);
        }
      }
      
      // 2. 语言要求指令
      const { general } = useConfigStore.getState();
      const userLanguage = localSettingsData?.language || general.language || 'zh-CN';
      
      if (userLanguage === 'zh-CN') {
        systemParts.push('\n\n--- 语言要求 ---\n请使用简体中文回复。不要使用繁体字和港台用语');
      } else if (userLanguage === 'zh-TW') {
        systemParts.push('\n\n--- 語言要求 ---\n請使用繁體中文回覆。使用台灣地區的用語習慣');
      } else if (userLanguage === 'en-US') {
        systemParts.push('\n\n--- Language Requirement ---\nPlease respond in English');
      } else if (userLanguage === 'ja-JP') {
        systemParts.push('\n\n--- 言語要件 ---\n日本語で回答してください');
      } else if (userLanguage === 'ko-KR') {
        systemParts.push('\n\n--- 언어 요구사항 ---\n한국어로 답변해 주세요');
      }
      
      // 插入完整的系统消息
      if (systemParts.length > 0) {
        messagesList.unshift({ 
          role: 'system', 
          content: systemParts.join('\n\n')
        });
        logger.info('MessageList.saveAndSendEdit', 'Complete system message inserted with language requirement');
      }
      
      let provider, modelId, modelConfig;
      if (currentModel) {
        provider = providers.find(p => p.id === currentModel.providerId);
        modelId = currentModel.modelId;
      } else {
        provider = providers.find(p => p.apiKey);
        modelId = defaultModels.chat;
      }
      
      if (provider && provider.models) {
        modelConfig = provider.models.find(m => m.id === modelId);
      }
      
      if (!provider || !provider.apiKey) return;
      
      // 如果模型不支持多模态，过滤掉消息中的图片内容，将OCR内容合并到文本
      if (!modelConfig?.capabilities?.multimodal) {
        logger.debug('MessageList.saveAndSend', 'Non-multimodal model detected, filtering image content and merging OCR');
        messagesList.forEach((msg, index) => {
          if (Array.isArray(msg.content)) {
            let textContent = '';
            if (msg.ocrContent) {
              const inputText = msg.content.find(part => part.type === 'text')?.text || '';
              // 合并用户输入和OCR识别内容
              if (inputText && inputText.trim()) {
                textContent = inputText + "\n\n" + msg.ocrContent;
              } else {
                // 如果用户没有文本输入，只有图片，则只使用OCR内容
                textContent = msg.ocrContent;
              }
              logger.debug('MessageList.saveAndSend', `Message ${index} OCR merged:`, {
                hasUserInput: !!inputText,
                ocrLength: msg.ocrContent.length,
                finalLength: textContent.length
              });
            } else {
              textContent = msg.content
                .filter(part => part.type === 'text')
                .map(part => part.text)
                .join('\n');
            }
            msg.content = textContent;
          }
        });
        logger.info('MessageList.saveAndSend', 'Image content filtered, messagesList prepared for non-multimodal model');
      }
      
      const requestOptions = {
        max_tokens: effectivePresets.maxTokens || modelConfig?.maxTokens || 4096
      };
      if (modelConfig?.maxThinkingTokens) requestOptions.max_thinking_tokens = modelConfig.maxThinkingTokens;
      if (effectivePresets.temperature !== null) requestOptions.temperature = effectivePresets.temperature;
      if (effectivePresets.topP !== null) requestOptions.top_p = effectivePresets.topP;
      if (effectivePresets.topK !== null) requestOptions.top_k = effectivePresets.topK;
      if (effectivePresets.frequencyPenalty !== null) requestOptions.frequency_penalty = effectivePresets.frequencyPenalty;
      if (effectivePresets.presencePenalty !== null) requestOptions.presence_penalty = effectivePresets.presencePenalty;
      
      const assistantMsgId = await addMessage({
          role: 'assistant',
          content: '',
          model: modelId,
          thinkingTime: null
      }, currentConversationId, currentUserMsg.id);

      setConversationState(currentConversationId, {
        isAIGenerating: true,
        streamingMessage: { id: assistantMsgId, role: 'assistant', content: '', conversationId: currentConversationId, model: modelId },
        reasoningStartTime: null,
        reasoningEndTime: null
      });
      await setConversationGenerating(currentConversationId, true);
      
      let reasoningText = '';
      let mReasoningStartTime = null;
      let mReasoningEndTime = null;
      
      await chatCompletion({
        provider: provider.id,
        model: modelId,
        messages: messagesList,
        apiKey: provider.apiKey,
        baseUrl: provider.baseUrl,
        proxyConfig: proxy,
        format: provider.format || 'openai',
        options: requestOptions,
        onStream: (chunk) => {
          if (mReasoningStartTime && !mReasoningEndTime) {
            mReasoningEndTime = Date.now();
            setConversationState(currentConversationId, { reasoningEndTime: mReasoningEndTime });
          }
          const convState = useChatStore.getState().getConversationState(currentConversationId);
          const currentStreaming = convState.streamingMessage;
          const newContent = (currentStreaming?.content || '') + chunk;
          setConversationState(currentConversationId, { 
            streamingMessage: { ...currentStreaming, content: newContent }
          });
          updateMessageById(assistantMsgId, { 
            content: newContent, 
            reasoning: reasoningText,
            thinkingTime: mReasoningEndTime && mReasoningStartTime ? (mReasoningEndTime - mReasoningStartTime) / 1000 : null
          }); 
        },
        onThinking: (thinking) => {
          if (!mReasoningStartTime) {
            mReasoningStartTime = Date.now();
            setConversationState(currentConversationId, { reasoningStartTime: mReasoningStartTime });
          }
          reasoningText += thinking;
          setConversationState(currentConversationId, { isReasoning: true, reasoningContent: reasoningText });
          if (assistantMsgId) {
            db.messages.update(assistantMsgId, { reasoning: reasoningText });
          }
        }
      });
      
    } catch (error) {
      logger.error('MessageList', 'Save and send failed:', error);
    } finally {
      setAIGenerating(false);
      setReasoning(false, '');
      setStreamingMessage(null);
      await setConversationGenerating(currentConversationId, false);
    }
  }, [editContent, currentConversationId, updateMessage, updateMessageById, messages, conversationPresets, providers, currentModel, proxy, setAIGenerating, setReasoning, setStreamingMessage, addMessage, setConversationGenerating, setConversationState, getConversationSettings, defaultModels]);

  const handleSwitchBranch = useCallback(async (msg, direction) => {
    if (!msg.siblings || msg.siblings.length <= 1) return;
    const currentIndex = msg.siblingIndex - 1; 
    let targetIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= msg.siblings.length) return;
    await switchBranch(msg.id, msg.siblings[targetIndex]);
  }, [switchBranch]);
  
  const regenerateMessage = useCallback(async (index) => {
    const allMessages = messages;
    if (index === 0 || !allMessages[index - 1] || allMessages[index - 1].role !== 'user') return;
    const parentId = allMessages[index].parentId;
    
    try {
      const localSettingsData = await getConversationSettings(currentConversationId);
      const effectivePresets = { ...conversationPresets };
      if (localSettingsData) {
        if (localSettingsData.systemPrompt !== null) effectivePresets.systemPrompt = localSettingsData.systemPrompt;
        if (localSettingsData.contextLimit !== null) effectivePresets.contextLimit = localSettingsData.contextLimit;
        if (localSettingsData.temperature !== null) effectivePresets.temperature = localSettingsData.temperature;
        if (localSettingsData.topP !== null) effectivePresets.topP = localSettingsData.topP;
        if (localSettingsData.topK !== null) effectivePresets.topK = localSettingsData.topK;
        if (localSettingsData.frequencyPenalty !== null) effectivePresets.frequencyPenalty = localSettingsData.frequencyPenalty;
        if (localSettingsData.presencePenalty !== null) effectivePresets.presencePenalty = localSettingsData.presencePenalty;
        if (localSettingsData.maxTokens !== null) effectivePresets.maxTokens = localSettingsData.maxTokens;
      }
      const messagesList = allMessages.slice(0, index).map(m => ({ 
        role: m.role, 
        content: m.content,
        ...(m.ocrContent ? { ocrContent: m.ocrContent } : {})
      }));
      
      // 构建完整的系统消息（包含用户提示词和语言要求）
      const systemParts = [];
      
      // 1. 用户自定义的系统提示词（或默认提示词）
      if (effectivePresets.systemPrompt && effectivePresets.systemPrompt.trim()) {
        systemParts.push(effectivePresets.systemPrompt.trim());
      } else {
        // 如果用户没有配置系统提示词，使用翻译的默认提示词
        const defaultPrompt = t('settings.conversation.promptPlaceholder');
        systemParts.push(defaultPrompt);
      }

      // 1.1 添加已上传的文档内容
      const documentsContent = useFileStore.getState().getCompletedFilesContent(currentConversationId);
      if (documentsContent) {
        systemParts.push('\n\n--- Uploaded Document Content ---\n' + documentsContent);
        logger.info('MessageList.regenerateMessage', 'Added document content to system message');
      }
      
      // 1.2 添加知识库检索的相关文档
      const { activeKnowledgeBase, retrieveDocuments } = useKnowledgeBaseStore.getState();
      if (activeKnowledgeBase) {
        // 重新生成时，使用上一条用户消息作为检索 query
        const prevUserMsg = allMessages[index - 1];
        let query = '';
        if (prevUserMsg) {
          if (Array.isArray(prevUserMsg.content)) {
            query = prevUserMsg.content.filter(p => p.type === 'text').map(p => p.text).join('\n');
          } else {
            query = prevUserMsg.content;
          }
        }

        if (query) {
          logger.info('MessageList.regenerateMessage', 'Knowledge base active, retrieving documents...');
          const retrievedDocs = retrieveDocuments(query, activeKnowledgeBase);
          
          if (retrievedDocs.length > 0) {
            const kbContext = retrievedDocs.map((doc, idx) => 
              `[Document ${idx + 1}] ${doc.documentName}\n${doc.content}\nSimilarity: ${(doc.similarity * 100).toFixed(1)}%`
            ).join('\n\n');
            
            systemParts.push('\n\n--- Knowledge Base Documents ---\n' + kbContext);
            logger.info('MessageList.regenerateMessage', `Retrieved ${retrievedDocs.length} documents from KB`);
          }
        }
      }
      
      // 2. 语言要求指令
      const { general } = useConfigStore.getState();
      const userLanguage = localSettingsData?.language || general.language || 'zh-CN';
      
      if (userLanguage === 'zh-CN') {
        systemParts.push('\n\n--- 语言要求 ---\n请使用简体中文回复。不要使用繁体字和港台用语');
      } else if (userLanguage === 'zh-TW') {
        systemParts.push('\n\n--- 語言要求 ---\n請使用繁體中文回覆。使用台灣地區的用語習慣');
      } else if (userLanguage === 'en-US') {
        systemParts.push('\n\n--- Language Requirement ---\nPlease respond in English');
      } else if (userLanguage === 'ja-JP') {
        systemParts.push('\n\n--- 言語要件 ---\n日本語で回答してください');
      } else if (userLanguage === 'ko-KR') {
        systemParts.push('\n\n--- 언어 요구사항 ---\n한국어로 답변해 주세요');
      }
      
      // 插入完整的系统消息
      if (systemParts.length > 0) {
        messagesList.unshift({ 
          role: 'system', 
          content: systemParts.join('\n\n')
        });
        logger.info('MessageList.regenerateMessage', 'Complete system message inserted with language requirement');
      }
      
      let provider, modelId, modelConfig;
      if (currentModel) {
        provider = providers.find(p => p.id === currentModel.providerId);
        modelId = currentModel.modelId;
      } else {
        provider = providers.find(p => p.apiKey);
        modelId = defaultModels.chat;
      }
      if (provider && provider.models) modelConfig = provider.models.find(m => m.id === modelId);
      if (!provider || !provider.apiKey) return;
      
      // 如果模型不支持多模态，过滤掉消息中的图片内容，将OCR内容合并到文本
      if (!modelConfig?.capabilities?.multimodal) {
        logger.debug('MessageList.regenerateMessage', 'Non-multimodal model detected, filtering image content and merging OCR');
        messagesList.forEach((msg, index) => {
          if (Array.isArray(msg.content)) {
            let textContent = '';
            if (msg.ocrContent) {
              const inputText = msg.content.find(part => part.type === 'text')?.text || '';
              // 合并用户输入和OCR识别内容
              if (inputText && inputText.trim()) {
                textContent = inputText + "\n\n" + msg.ocrContent;
              } else {
                // 如果用户没有文本输入，只有图片，则只使用OCR内容
                textContent = msg.ocrContent;
              }
              logger.debug('MessageList.regenerateMessage', `Message ${index} OCR merged:`, {
                hasUserInput: !!inputText,
                ocrLength: msg.ocrContent.length,
                finalLength: textContent.length
              });
            } else {
              textContent = msg.content
                .filter(part => part.type === 'text')
                .map(part => part.text)
                .join('\n');
            }
            msg.content = textContent;
          }
        });
        logger.info('MessageList.regenerateMessage', 'Image content filtered, messagesList prepared for non-multimodal model');
      }
      
      const assistantMsgId = await addMessage({ role: 'assistant', content: '', model: modelId }, currentConversationId, parentId);
      setConversationState(currentConversationId, {
        isAIGenerating: true,
        streamingMessage: { id: assistantMsgId, role: 'assistant', content: '', conversationId: currentConversationId, model: modelId },
        reasoningStartTime: null,
        reasoningEndTime: null
      });
      await setConversationGenerating(currentConversationId, true);

      let reasoningText = '';
      let mReasoningStartTime = null;
      let mReasoningEndTime = null;
      
      await chatCompletion({
        provider: provider.id,
        model: modelId,
        messages: messagesList,
        apiKey: provider.apiKey,
        baseUrl: provider.baseUrl,
        proxyConfig: proxy,
        format: provider.format || 'openai',
        options: { temperature: effectivePresets.temperature, max_tokens: effectivePresets.maxTokens },
         onStream: (chunk) => {
          if (mReasoningStartTime && !mReasoningEndTime) {
            mReasoningEndTime = Date.now();
            setConversationState(currentConversationId, { reasoningEndTime: mReasoningEndTime });
          }
          const convState = useChatStore.getState().getConversationState(currentConversationId);
          const currentStreaming = convState.streamingMessage;
          const newContent = (currentStreaming?.content || '') + chunk;
          setConversationState(currentConversationId, { 
            streamingMessage: { ...currentStreaming, content: newContent, isRegenerating: true }
          });
          updateMessageById(assistantMsgId, { content: newContent, reasoning: reasoningText }); 
        },
        onThinking: (thinking) => {
          if (!mReasoningStartTime) {
            mReasoningStartTime = Date.now();
            setConversationState(currentConversationId, { reasoningStartTime: mReasoningStartTime });
          }
          reasoningText += thinking;
          setConversationState(currentConversationId, { isReasoning: true, reasoningContent: reasoningText });
          if (assistantMsgId) db.messages.update(assistantMsgId, { reasoning: reasoningText });
        }
      });
    } catch (error) {
      logger.error('MessageList', 'Regeneration failed:', error);
    } finally {
      setAIGenerating(false);
      setReasoning(false, '');
      setStreamingMessage(null);
      await setConversationGenerating(currentConversationId, false);
    }
  }, [messages, currentConversationId, conversationPresets, providers, currentModel, proxy, setAIGenerating, setReasoning, setStreamingMessage, updateMessageById, addMessage, setConversationGenerating, setConversationState, getConversationSettings, defaultModels]);

  return (
    <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar pb-24">
      {messages.length === 0 && (
        <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4">
          <Bot className="w-12 h-12 opacity-20" />
          <p>{t('message.startConversation')}</p>
        </div>
      )}
      {messages.map((msg, i) => {
        const isMsgGenerating = isAIGenerating && streamingMessage && (streamingMessage.id === msg.id);
        const showWordCount = localSettings?.showWordCount === true;
        const showTokenUsage = localSettings?.showTokenUsage === true;
        const showModelName = localSettings?.showModelName === true;

        return (
          <React.Fragment key={`${msg.id || i}-${msg.timestamp}`}>
            {/* 在压缩摘要消息前显示分隔线 */}
            {msg.isCompressionSummary && (
              <div className="flex items-center gap-3 my-6 max-w-5xl mx-auto">
                <div className="flex-1 border-t-2 border-dashed border-border/50"></div>
                <span className="text-xs text-muted-foreground/60 font-medium px-2">{t('compression.newTopic')}</span>
                <div className="flex-1 border-t-2 border-dashed border-border/50"></div>
              </div>
            )}
            
            <div className="group/msg relative">
              <MessageItem
                msg={msg}
                index={i}
                isEditing={editingMessageIndex === i}
                editContent={editContent}
                onEditContentChange={setEditContent}
                onSaveEdit={saveEdit}
                onSaveAndSend={saveAndSend}
                onCancelEdit={cancelEdit}
                onStartEdit={startEditMessage}
                onCopy={copyMessage}
                onQuote={quoteMessage}
                onRegenerate={regenerateMessage}
                onSwitchBranch={handleSwitchBranch}
                copySuccessIndex={copySuccessIndex}
                isGenerating={isAIGenerating}
                getModelDisplayName={getModelDisplayName}
                isMsgGenerating={isMsgGenerating}
                reasoningContent={isMsgGenerating ? reasoningContent : null}
                reasoningStartTime={isMsgGenerating ? reasoningStartTime : null}
                isReasoning={isMsgGenerating ? isReasoning : false}
                reasoningEndTime={isMsgGenerating ? reasoningEndTime : null}
              />
              {msg.role === 'assistant' && (showModelName || showWordCount || showTokenUsage) && (
                <div className="flex flex-wrap items-center gap-3 px-12 -mt-3 mb-4 text-[10px] text-muted-foreground/50 transition-opacity">
                  {showModelName && msg.model && (
                    <span className="flex items-center gap-1 bg-accent/30 px-1.5 py-0.5 rounded">
                      {getModelDisplayName(msg.model)}
                    </span>
                  )}
                  {showWordCount && msg.content && (
                    <span className="bg-accent/30 px-1.5 py-0.5 rounded">
                      {msg.content.length} {t('message.wordCount')}
                    </span>
                  )}
                  {showTokenUsage && (
                    <span className="bg-accent/30 px-1.5 py-0.5 rounded">
                      {t('message.tokens')} {Math.ceil((msg.content?.length || 0) * 1.5)}
                    </span>
                  )}
                </div>
              )}
            </div>
          </React.Fragment>
        );
      })}

      {isAIGenerating && streamingMessage && 
       streamingMessage.conversationId === currentConversationId && 
       !streamingMessage.isRegenerating && 
       messages.every(m => m.id !== streamingMessage.id) && 
       (messages.length === 0 || messages[messages.length - 1].id === streamingMessage.parentId) && (
        <div className="flex gap-3 max-w-5xl mx-auto w-full mb-6">
          <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            {reasoningContent && (
              <ReasoningBlock 
                content={reasoningContent} 
                isActive={isReasoning && !reasoningEndTime} 
                model={streamingMessage.model}
                startTime={reasoningStartTime}
                time={reasoningEndTime && reasoningStartTime ? ((reasoningEndTime - reasoningStartTime) / 1000).toFixed(1) : null}
              />
            )}
            <div className="text-sm leading-relaxed">
              {streamingMessage.content ? (
                <MarkdownRenderer content={streamingMessage.content} isGenerating={true} />
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground py-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-xs">{isReasoning ? t('message.thinking') : t('message.generating')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageList;
