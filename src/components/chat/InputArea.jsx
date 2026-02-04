import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Send, Plus, Camera, Search, ChevronUp, Cpu, Loader2, Globe, Brain, Sparkles, X, ChevronDown, Check, Settings, Paperclip, Square, BookOpen, Sliders, ArrowUp, FileText, Minimize2, RefreshCw, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { useChatStore } from '../../store/useChatStore';
import { useConfigStore } from '../../store/useConfigStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useFileStore } from '../../store/useFileStore';
import { syncService } from '../../services/syncService';
import { useViewStore } from '../../store/useViewStore';
import { compressImage } from '../../utils/imageCompression';
import { useTranslation } from '../../i18n';
import { useKnowledgeBaseStore } from '../../store/useKnowledgeBaseStore';
import { chatCompletion, search, compressMessages } from '../../services/aiService';
import { logger } from '../../services/logger';
import { cn } from '../../utils/cn';
import { isMobileDevice } from '../../utils/envDetect';
import { shallow } from 'zustand/shallow';
import { db } from '../../db';
import FileUpload from './FileUpload';
import ConversationSettings from './ConversationSettings';
import KnowledgeBaseSelector from './KnowledgeBaseSelector';
import VirtualList from '../ui/VirtualList';
import ImagePreviewModal from '../ui/ImagePreviewModal';
import CameraCapture from './CameraCapture';

/**
 * 厂商视觉品牌映射
 * 用于在模型选择器中通过颜色快速识别不同的 AI 提供商
 */
const PROVIDER_BRAND_COLORS = {
  'openai': { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400' },
  'anthropic': { bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400' },
  'google': { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400' },
  'gemini': { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400' },
  'ollama': { bg: 'bg-slate-500/10', text: 'text-slate-600 dark:text-slate-400' },
  'deepseek': { bg: 'bg-cyan-500/10', text: 'text-cyan-600 dark:text-cyan-400' },
  'siliconflow': { bg: 'bg-indigo-500/10', text: 'text-indigo-600 dark:text-indigo-400' },
  'openrouter': { bg: 'bg-violet-500/10', text: 'text-violet-600 dark:text-violet-400' },
  'mistral': { bg: 'bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400' },
  'groq': { bg: 'bg-yellow-500/10', text: 'text-yellow-600 dark:text-yellow-500' },
  'perplexity': { bg: 'bg-teal-500/10', text: 'text-teal-600 dark:text-teal-400' },
  'xai': { bg: 'bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400' },
  'aliyun': { bg: 'bg-blue-600/10', text: 'text-blue-700 dark:text-blue-400' },
  'chatglm': { bg: 'bg-green-500/10', text: 'text-green-600 dark:text-green-400' },
  'volcengine': { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400' },
  'azure': { bg: 'bg-sky-500/10', text: 'text-sky-600 dark:text-sky-400' },
  'lmstudio': { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400' },
};

/**
 * 获取厂商对应的品牌色配置
 */
const getProviderColors = (providerId) => {
  const id = String(providerId).toLowerCase();
  return PROVIDER_BRAND_COLORS[id] || { bg: 'bg-accent', text: 'text-muted-foreground' };
};

/**
 * 聊天输入交互区域组件
 * 核心功能：处理用户输入（文本/图片）、调度 OCR、管理文件上传、模型切换及 AI 请求生命周期
 */
const InputArea = () => {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [isSearchEnabled, setIsSearchEnabled] = useState(false);
  const [isReasoningEnabled, setIsReasoningEnabled] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showConvSettings, setShowConvSettings] = useState(false);
  const [showKBSelector, setShowKBSelector] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraInitialImage, setCameraInitialImage] = useState(null);
  const [localSettings, setLocalSettings] = useState(null);
  const [pendingImages, setPendingImages] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const [isSyncSuccess, setIsSyncSuccess] = useState(false);
  const [isSyncError, setIsSyncError] = useState(false);
  const [modelSearchQuery, setModelSearchQuery] = useState('');
  const fileInputRef = useRef(null);
  const modelSearchInputRef = useRef(null);

  // 从聊天状态管理中获取操作方法（使用shallow比较优化性能）
  const { 
    addMessage, 
    createNewConversation, 
    autoRenameConversation, 
    setCurrentModel, 
    setReasoning,
    getMessages,
    setAIGenerating,
    setStreamingMessage,
    setConversationGenerating,
    stopAIGeneration,
    setAbortController,
    clearAbortController,
    getConversationState,
    setConversationState,
    getConversationSettings,
    compressConversation,
    applyCompression,
    getMessagesForAI
  } = useChatStore(
    (state) => ({
      addMessage: state.addMessage,
      createNewConversation: state.createNewConversation,
      autoRenameConversation: state.autoRenameConversation,
      setCurrentModel: state.setCurrentModel,
      setReasoning: state.setReasoning,
      getMessages: state.getMessages,
      setAIGenerating: state.setAIGenerating,
      setStreamingMessage: state.setStreamingMessage,
      setConversationGenerating: state.setConversationGenerating,
      stopAIGeneration: state.stopAIGeneration,
      setAbortController: state.setAbortController,
      clearAbortController: state.clearAbortController,
      getConversationState: state.getConversationState,
      setConversationState: state.setConversationState,
      getConversationSettings: state.getConversationSettings,
      compressConversation: state.compressConversation,
      applyCompression: state.applyCompression,
      getMessagesForAI: state.getMessagesForAI
    }),
    shallow
  );

  // 订阅当前对话状态
  const currentConversationId = useChatStore((state) => state.currentConversationId);
  const currentModel = useChatStore((state) => state.currentModel);
  const isIncognito = useChatStore((state) => state.isIncognito);
  
  // 精准订阅当前对话的AI生成状态，避免不必要的重渲染
  const currentIsAIGenerating = useChatStore((state) => {
    const id = state.currentConversationId;
    return state.conversationStates[id]?.isAIGenerating || false;
  });
  const { providers, defaultModels, proxy, searchSettings, conversationPresets, conversationSettings, getEffectiveModel } = useConfigStore();
  const { getCompletedFilesContent, addFile, getFilesByConversation, removeFile, updateFileConversationId, attachFilesToMessage } = useFileStore();
  const { activeKnowledgeBase, retrieveDocuments } = useKnowledgeBaseStore();
  const textareaRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  // 获取当前对话的已上传文件 (仅显示未关联到消息的文件)
  const uploadedFiles = getFilesByConversation(currentConversationId || 'temp').filter(f => !f.messageId);

  // 检查所有文件是否都已解析完成
  const isFilesReady = useMemo(() => {
    return uploadedFiles.every(f => f.status === 'completed');
  }, [uploadedFiles]);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    const docFiles = files.filter(f => !f.type.startsWith('image/'));
    
    if (imageFiles.length > 0) processImageFiles(imageFiles);
    
    if (docFiles.length > 0) {
      const targetConvId = currentConversationId || 'temp';
      for (const file of docFiles) {
        try {
          await addFile(file, targetConvId);
        } catch (err) {
          logger.error('InputArea', 'Failed to add file:', file.name, err);
          // 这里的报错由 store 或 documentParser 抛出，我们向用户提示
          alert(t('inputArea.error') + `: ${file.name} - ${err.message}`);
        }
      }
    }
    
    // 重置 input 以便允许再次选择相同文件
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processImageFiles = async (files) => {
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      
      try {
        // 压缩图片
        const compressedDataUrl = await compressImage(file, {
          maxWidth: 1920,
          maxHeight: 1920,
          quality: 0.8
        });

        setPendingImages(prev => [...prev, {
          id: Date.now() + Math.random(),
          data: compressedDataUrl,
          file
        }]);
      } catch (err) {
        logger.error('InputArea', 'Failed to process image file', err);
        alert(t('inputArea.error') + ': ' + (err.message || 'Image processing failed'));
      }
    }
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const imageFiles = [];
    const docFiles = [];
    
    for (const item of items) {
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file) {
           if (file.type.startsWith('image/')) {
             imageFiles.push(file);
           } else {
             docFiles.push(file);
           }
        }
      }
    }

    if (imageFiles.length > 0) {
      e.preventDefault();
      processImageFiles(imageFiles);
    }
    
    if (docFiles.length > 0) {
       e.preventDefault();
       const targetConvId = currentConversationId || 'temp';
       docFiles.forEach(file => addFile(file, targetConvId));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    const docFiles = files.filter(f => !f.type.startsWith('image/'));

    if (imageFiles.length > 0) processImageFiles(imageFiles);
    
    if (docFiles.length > 0) {
       const targetConvId = currentConversationId || 'temp';
       docFiles.forEach(file => addFile(file, targetConvId));
    }
  };

  const removePendingImage = (id) => {
    setPendingImages(prev => prev.filter(img => img.id !== id));
  };

  // 初始化当前模型：如果未设置则使用默认模型或第一个可用模型
  useEffect(() => {
    if (!currentModel) {
      // 查找设置中的默认聊天模型
      const defaultChatModelId = defaultModels.chat;
      if (defaultChatModelId) {
        for (const p of providers) {
          const m = p.models?.find(m => m.id === defaultChatModelId);
          if (m) {
            setCurrentModel({ providerId: p.id, modelId: m.id });
            return;
          }
        }
      }
      
      // 备用方案：使用第一个可用模型
      const active = providers.find(p => p.apiKey && p.models?.length > 0);
      if (active) {
        const firstSelected = active.models.find(m => m.selected === true) || active.models[0];
        setCurrentModel({ providerId: active.id, modelId: firstSelected.id });
      }
    }
  }, [providers, defaultModels, currentModel, setCurrentModel]);

  // 对话切换时重置本地UI加载状态
  useEffect(() => {
    setIsLoading(false);
    setIsSending(false);
    logger.debug('InputArea', 'Conversation switched, resetting local UI state:', currentConversationId);
  }, [currentConversationId]);

  // 监听对话切换或设置更新
  useEffect(() => {
    const loadLocalSettings = async () => {
      const settings = await getConversationSettings(currentConversationId);
      setLocalSettings(settings);
    };
    loadLocalSettings();
    
    // 定时轮询以确保及时响应（500ms）
    const interval = setInterval(loadLocalSettings, 500);
    return () => clearInterval(interval);
  }, [currentConversationId, getConversationSettings]);

  // 监控状态变化用于调试
  useEffect(() => {
    const convState = getConversationState(currentConversationId);
  }, [currentConversationId, isLoading, isSending, input]);

  // 组件加载时确保状态正常
  useEffect(() => {
    logger.debug('InputArea', 'Component initialized, resetting local UI state');
    setIsLoading(false);
    setIsSending(false);
  }, []);

  // 监听页面切换，自动关闭所有弹窗
  const currentView = useViewStore(state => state.currentView);
  useEffect(() => {
    if (showModelSelector) {
      setTimeout(() => {
        modelSearchInputRef.current?.focus();
      }, 50);
    }
  }, [showModelSelector]);

  useEffect(() => {
    if (currentView !== 'chat') {
      // 切换到非聊天页面时，关闭所有弹窗
      setShowModelSelector(false);
      setShowFileUpload(false);
      setShowConvSettings(false);
      setShowKBSelector(false);
      setShowCamera(false);
      setPreviewImage(null);
      logger.debug('InputArea', 'Page switched, closing all popups');
    }
  }, [currentView]);

  /**
   * 核心业务逻辑：消息发送与 AI 回复链路
   * 包含：
   * 1. 自动创建新对话
   * 2. 多模态/OCR 逻辑预处理
   * 3. 异步标题生成
   * 4. 动态上下文构建（系统消息、文档注入、RAG 检索）
   * 5. 自动对话压缩（根据 Token 限制）
   * 6. 流式请求执行与异常捕获
   */
  const handleSend = async () => {
    logger.info('InputArea', 'handleSend called');
      
    // 防止重复发送
    if (isSending) {
      logger.warn('InputArea', 'Already sending, preventing duplicate call');
      return;
    }

    // 验证文件解析状态
    if (!isFilesReady) {
      logger.warn('InputArea', 'Send blocked: files not ready');
      return;
    }
      
    // 验证输入内容和加载状态 (如果有图片或文件，允许空文本)
    const hasContent = input.trim() || pendingImages.length > 0 || uploadedFiles.length > 0;
    if (!hasContent || isLoading) {
      logger.warn('InputArea', 'Send blocked:', { hasContent, isLoading });
      return;
    }
      
    logger.info('InputArea', 'User input length:', input.length, 'Images:', pendingImages.length);
      
    // 立即锁定状态，防止并发请求
    setIsSending(true);
    setIsLoading(true);
    
    let convId = currentConversationId;
    const isNew = !convId;
    
    // 判断是否需要自动重命名对话标题
    let shouldRename = isNew;
    if (!shouldRename && convId) {
      const existingMessages = await getMessages(convId);
      if (existingMessages.length === 0) {
        shouldRename = true;
        logger.debug('InputArea', 'Empty conversation detected, marking for rename');
      }
    }

    if (isNew) {
      convId = await createNewConversation(input.slice(0, 20));
      logger.info('InputArea', 'Created new conversation:', convId);
      
      // 将临时文件归属转移到新对话
      updateFileConversationId('temp', convId);
    }
    
    // 记录 AI 开始生成时的当前对话 ID，用于后续判断是否需要标记未读
    const conversationIdWhenStarted = currentConversationId;
    
    // 设置对话的AI生成状态（初步标记，streamingMessage将在创建assistant消息后初始化）
    setConversationState(convId, { isAIGenerating: true });
    
    // 同步更新数据库中的生成状态（用于侧边栏显示）
    await setConversationGenerating(convId, true);

    // 构建用户消息内容
    let userMsg = input;
    let messageContent = input;
    let ocrContentForMsg = null; // 用于存储OCR提取的文本
    let displayImages = []; // 用于在UI显示的图片（如果是OCR模式，不显示图片在消息气泡中，或者另行处理）
    
    // 处理图片逻辑
    if (pendingImages.length > 0) {
      // 获取当前模型信息
      let activeProviderId = currentModel?.providerId;
      let activeModelId = currentModel?.modelId;
      
      if (!activeModelId) {
        // Fallback detection logic same as in initialization
        const defaultChatModelId = defaultModels.chat;
        if (defaultChatModelId) {
          for (const p of providers) {
            const m = p.models?.find(m => m.id === defaultChatModelId);
            if (m) {
              activeProviderId = p.id;
              activeModelId = m.id;
              break;
            }
          }
        }
        if (!activeModelId) {
          const active = providers.find(p => p.apiKey && p.models?.length > 0);
          if (active) {
            activeProviderId = active.id;
            activeModelId = (active.models.find(m => m.selected) || active.models[0]).id;
          }
        }
      }

      // 获取模型能力
      const providerConfig = providers.find(p => p.id === activeProviderId);
      const modelConfig = providerConfig?.models?.find(m => m.id === activeModelId);
      const isMultimodal = modelConfig?.capabilities?.multimodal;

      if (isMultimodal) {
        // 多模态模型：直接构造带图片的消息
        messageContent = [
          { type: 'text', text: input },
          ...pendingImages.map(img => ({
            type: 'image_url',
            image_url: { url: img.data }
          }))
        ];
        // 清空图片暂存
        setPendingImages([]);
      } else {
        // 非多模态模型：尝试使用OCR
        // 使用智能模型选择获取有效的OCR模型
        const effectiveOCR = getEffectiveModel('ocr');
        
        // 查找模型配置以检查能力
        const ocrModelConfig = effectiveOCR?.provider?.models?.find(m => m.id === effectiveOCR.modelId);
        
        // 严格检查：必须是明确配置的OCR模型，且支持多模态
        // getEffectiveModel 返回 source: 'configured' 表示是用户在设置中明确绑定的模型
        const isOCRConfigured = effectiveOCR?.source === 'configured';
        const isOCRSupported = ocrModelConfig?.capabilities?.multimodal;

        if (!effectiveOCR || !isOCRConfigured || !isOCRSupported) {
          // 未配置OCR模型或找到的模型不支持视觉，显示错误并中断发送
          await addMessage({
            role: 'assistant',
            content: t('inputArea.ocrNotConfigured')
          }, convId);
          setIsLoading(false);
          setIsSending(false);
          setConversationState(convId, { isAIGenerating: false });
          await setConversationGenerating(convId, false);
          return; // 中断流程
        }

        const ocrProvider = effectiveOCR.provider;
        const ocrModelId = effectiveOCR.modelId;

        // 使用OCR模型提取文本
        try {
          // 提示用户正在进行OCR处理
          logger.info('InputArea', 'Performing OCR with model:', ocrModelId, 'Provider:', ocrProvider.id);

          const ocrResults = [];
          for (const img of pendingImages) {
            const ocrResponse = await chatCompletion({
              provider: ocrProvider.id,
              model: ocrModelId,
              messages: [
                {
                  role: 'user',
                  content: [
                    { type: 'text', text: 'Please extract all text from this image accurately. Output only the extracted text.' },
     
                    { type: 'image_url', image_url: { url: img.data } }
                  ]
                }
              ],
              apiKey: ocrProvider.apiKey,
              baseUrl: ocrProvider.baseUrl,
              proxyConfig: proxy,
              format: ocrProvider.format || 'openai',
              stream: false
            });
            ocrResults.push(ocrResponse);
          }

          const combinedOcrText = ocrResults.join('\n\n');
          // For AI context: clearly mark this is OCR text extracted from images
          // 符合记忆要求：明确标识这是OCR从图片中提取的文本，防止AI误判为系统故障
          const fullOcrContext = `${t('ocr.contextHeader')}
${t('ocr.contextIntro')}

${combinedOcrText}

${t('ocr.contextFooter')}`;
          
          // For Display: Input + Image + Notice
          // We DO NOT show OCR text in the bubble
          messageContent = [
            { type: 'text', text: input },
            ...pendingImages.map(img => ({
              type: 'image_url',
              image_url: { url: img.data }
            })),
            { 
              type: 'ocr_notice', 
              chatModel: currentModelData?.name || currentModel?.modelId || 'Current Model' 
            }
          ];
          
          // We attach the OCR text to the message object so it can be retrieved for context later
          // Note: addMessage call below needs to be updated to accept extra fields or we merge it here
          // But addMessage takes (msg, convId). 'msg' object is spread. So we can add ocrContent property.
          
          // Store OCR content in a variable accessible to the outer scope
          // We will pass this to addMessage later
          ocrContentForMsg = fullOcrContext;

          setPendingImages([]);
          
        } catch (ocrError) {
          logger.error('InputArea', 'OCR processing failed:', ocrError);
          await addMessage({
            role: 'assistant',
            content: `${t('inputArea.error')} OCR processing failed: ${ocrError.message}`
          }, convId);
          setIsLoading(false);
          setIsSending(false);
          setConversationState(convId, { isAIGenerating: false });
          await setConversationGenerating(convId, false);
          return;
        }
      }
    }

    const userMessagePayload = {
      role: 'user',
      content: messageContent, // 这里可能是字符串或数组
    };
    if (ocrContentForMsg) {
      userMessagePayload.ocrContent = ocrContentForMsg;
    }
    
    // 如果有已上传的文档，将其关联到消息中
    const filesToSend = uploadedFiles;
    if (filesToSend.length > 0) {
      userMessagePayload.files = filesToSend.map(f => ({
        id: f.id,
        name: f.name,
        size: f.size,
        type: f.type
      }));
    }

    const msgId = await addMessage(userMessagePayload, convId);
    
    // 更新文件状态，标记为已关联到该消息
    if (filesToSend.length > 0 && msgId) {
      attachFilesToMessage(filesToSend.map(f => f.id), msgId);
    }

    logger.info('InputArea', 'User message added');
    
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    // 异步触发后台命名任务，不阻塞UI
    if (shouldRename) {
      logger.info('InputArea', 'Triggering auto-rename...');
      
      // 稍微延迟触发，避免与主回复请求抢占同一个 API 账号的并发额度或导致某些模型的频率限制
      // 尤其是在首次请求时，主回复和命名任务同时发起导致某些供应商（如小米相关的 Qwen）处理异常
      setTimeout(() => {
        autoRenameConversation(convId, userMsg, { providers, defaultModels, proxy })
          .then(() => {
            logger.info('InputArea', 'Auto-rename task completed');
          })
          .catch((error) => {
            logger.error('InputArea', 'Auto-rename failed:', error);
          });
      }, 2000);
    }

    try {
      // 加载对话级设置并合并全局设置
      const localSettingsData = await getConversationSettings(convId);
      const effectivePresets = { ...conversationPresets };
      
      if (localSettingsData) {
        logger.debug('InputArea', 'Using local conversation settings:', localSettingsData);
        // 合并对话级设置，仅覆盖非null的字段
        if (localSettingsData.systemPrompt !== null) effectivePresets.systemPrompt = localSettingsData.systemPrompt;
        if (localSettingsData.contextLimit !== null) effectivePresets.contextLimit = localSettingsData.contextLimit;
        if (localSettingsData.temperature !== null) effectivePresets.temperature = localSettingsData.temperature;
        if (localSettingsData.topP !== null) effectivePresets.topP = localSettingsData.topP;
        if (localSettingsData.topK !== null) effectivePresets.topK = localSettingsData.topK;
        if (localSettingsData.frequencyPenalty !== null) effectivePresets.frequencyPenalty = localSettingsData.frequencyPenalty;
        if (localSettingsData.presencePenalty !== null) effectivePresets.presencePenalty = localSettingsData.presencePenalty;
        if (localSettingsData.maxTokens !== null) effectivePresets.maxTokens = localSettingsData.maxTokens;
      }
      
      const history = await getMessagesForAI(convId); // 使用虚拟压缩后的消息列表
      // 获取当前 Assistant 消息的 ID 并在构造上下文时将其排除，避免重复历史记录
      const currentMessages = await getMessages(convId);
      const parentId = currentMessages.length > 0 ? currentMessages[currentMessages.length - 1].id : null;

      // 先检查模型配置，如果没有配置就直接显示错误消息并返回，避免创建空的assistant消息
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

      if (!provider || !provider.apiKey) {
        logger.error('InputArea', 'Model configuration error');
        // 直接添加错误消息并返回，不创建空的assistant消息
        await addMessage({
          role: 'assistant',
          content: t('inputArea.configureModels')
        }, convId);
        setIsLoading(false);
        setIsSending(false);
        setConversationState(convId, { isAIGenerating: false });
        await setConversationGenerating(convId, false);
        return;
      }
      
      logger.info('InputArea', 'Using model:', { providerId: provider.id, modelId });

      const assistantMsgId = await addMessage({
        role: 'assistant',
        content: '',
        model: modelId,
        thinkingTime: null
      }, convId, parentId);

      // 立即初始化streamingMessage，确保MessageList能显示加载动画
      // 这对于首次请求或响应较慢的模型（如小米系列）尤为重要
      setConversationState(convId, {
        isAIGenerating: true,
        streamingMessage: { 
          id: assistantMsgId, 
          parentId: parentId,
          role: 'assistant', 
          content: '', 
          conversationId: convId, 
          model: modelId
        },
        isReasoning: false,
        reasoningContent: '',
        reasoningStartTime: null,
        reasoningEndTime: null
      });

      const excludeId = assistantMsgId;
      let messages = history
        .filter(m => !m.id || m.id !== excludeId) // 虚拟消息没有id
        .map(m => ({ 
          role: m.role, 
          content: m.content,
          ...(m.ocrContent ? { ocrContent: m.ocrContent } : {})
        }));
      
      // 第一步：提取并移除系统消息，稍后统一处理
      const systemMessages = messages.filter(m => m.role === 'system');
      let userAssistantMessages = messages.filter(m => m.role !== 'system');
      
      // 第二步：应用上下文限制，超出限制时进行压缩
      if (effectivePresets.contextLimit !== null && effectivePresets.contextLimit >= 0) {
        if (userAssistantMessages.length > effectivePresets.contextLimit) {
          // 特殊情况：如果限制为 0，直接清空历史，不需要进入压缩逻辑
          if (effectivePresets.contextLimit === 0) {
            logger.info('InputArea', 'Context limit is 0, clearing all history');
            userAssistantMessages = [];
          } else {
            const excessCount = userAssistantMessages.length - effectivePresets.contextLimit;
            logger.info('InputArea', `Messages exceed limit (${userAssistantMessages.length} > ${effectivePresets.contextLimit}), compressing...`);
            
            // 获取压缩模型（优先使用对话级设置，然后是全局设置，最后回退到当前对话模型）
            let contextCompressionModelId = localSettingsData?.compressionModel || defaultModels.compression;
            
            // 如果没有配置压缩模型，使用当前对话模型作为回退
            if (!contextCompressionModelId && currentModel?.modelId) {
              contextCompressionModelId = currentModel.modelId;
              logger.info('InputArea', 'No compression model configured for context limit, using current conversation model:', contextCompressionModelId);
            }
            
            if (contextCompressionModelId) {
              try {
                // 提取需要压缩的消息（最旧的部分）
                const messagesToCompress = userAssistantMessages.slice(0, excessCount);
                const remainingMessages = userAssistantMessages.slice(excessCount);
                
                // 查找压缩模型的配置
                let compressionProvider = null;
                for (const p of providers) {
                  const m = p.models?.find(m => m.id === contextCompressionModelId);
                  if (m && p.apiKey) {
                    compressionProvider = p;
                    break;
                  }
                }
                
                if (compressionProvider) {
                  logger.info('InputArea', `Using compression model: ${contextCompressionModelId}`);
                  
                  // 调用 AI 压缩服务
                  const compressedContent = await compressMessages({
                    messages: messagesToCompress,
                    provider: compressionProvider.id,
                    model: contextCompressionModelId,
                    apiKey: compressionProvider.apiKey,
                    baseUrl: compressionProvider.baseUrl,
                    proxyConfig: proxy,
                    format: compressionProvider.format || 'openai'
                  });
                  
                  logger.info('InputArea', 'Message compression successful');
                  
                  // 压缩后的内容作为assistant消息插入到消息列表中
                  userAssistantMessages = [
                    {
                      role: 'assistant',
                      content: `[${t('compression.historySummary')}] ${compressedContent}`
                    },
                    ...remainingMessages
                  ];
                } else {
                  logger.warn('InputArea', 'Compression provider not found, using simple truncation');
                  userAssistantMessages = userAssistantMessages.slice(-effectivePresets.contextLimit);
                }
              } catch (compressionError) {
                logger.error('InputArea', 'Compression failed:', compressionError);
                // 压缩失败时降级为直接裁剪
                userAssistantMessages = userAssistantMessages.slice(-effectivePresets.contextLimit);
              }
            } else {
              logger.warn('InputArea', 'No compression model set, using simple truncation');
              userAssistantMessages = userAssistantMessages.slice(-effectivePresets.contextLimit);
            }
          }
        }
      }
      
      // 第二点五步：检查是否启用自动压缩功能
      const autoCompressEnabled = conversationSettings?.compression?.autoCompress || false;
      const autoCompressThreshold = conversationSettings?.compression?.autoCompressThreshold || 50;
      
      if (autoCompressEnabled && userAssistantMessages.length > autoCompressThreshold) {
        logger.info('InputArea', `Auto-compression triggered (${userAssistantMessages.length} > ${autoCompressThreshold})`);
        
        // 获取压缩模型（优先使用对话级设置，然后是全局设置，最后回退到当前对话模型）
        let autoCompressionModelId = localSettingsData?.compressionModel || defaultModels.compression;
        
        // 如果没有配置压缩模型，使用当前对话模型作为回退
        if (!autoCompressionModelId && currentModel?.modelId) {
          autoCompressionModelId = currentModel.modelId;
          logger.info('InputArea', 'No compression model configured for auto-compression, using current conversation model:', autoCompressionModelId);
        }
        
        if (autoCompressionModelId) {
          try {
            // 压缩除最后2条消息外的所有消息
            const messagesToCompress = userAssistantMessages.slice(0, -2);
            const remainingMessages = userAssistantMessages.slice(-2);
            
            if (messagesToCompress.length > 0) {
              // 查找压缩模型配置
              let compressionProvider = null;
              for (const p of providers) {
                const m = p.models?.find(m => m.id === autoCompressionModelId);
                if (m && p.apiKey) {
                  compressionProvider = p;
                  break;
                }
              }
              
              // 自动压缩回退逻辑：如果指定的压缩模型不可用，尝试使用当前模型
              if (!compressionProvider && currentModel?.modelId && currentModel.modelId !== autoCompressionModelId) {
                autoCompressionModelId = currentModel.modelId;
                for (const p of providers) {
                  const m = p.models?.find(m => m.id === autoCompressionModelId);
                  if (m && p.apiKey) {
                    compressionProvider = p;
                    break;
                  }
                }
              }
              
              if (compressionProvider) {
                logger.info('InputArea', `Auto-compression using model: ${autoCompressionModelId}`);
                
                // 调用 AI 压缩服务
                const compressedContent = await compressMessages({
                  messages: messagesToCompress.map(m => ({
                    role: m.role,
                    content: Array.isArray(m.content) ? m.content.filter(p => p.type === 'text').map(p => p.text).join('\n') : m.content
                  })),
                  provider: compressionProvider.id,
                  model: autoCompressionModelId,
                  apiKey: compressionProvider.apiKey,
                  baseUrl: compressionProvider.baseUrl,
                  proxyConfig: proxy,
                  format: compressionProvider.format || 'openai'
                });
                
                logger.info('InputArea', 'Auto-compression successful');
                
                // 构造压缩摘要文本
                const compressedText = `[${t('compression.autoCompressed')}] ${compressedContent}`;
                
                // 自动压缩不需要通过 applyCompression 存入数据库的消息树，
                // 因为它是在发送给 AI 的上下文中实时发生的虚拟压缩，
                // 或者是为了减小上下文压力。这里保持 userAssistantMessages 的更新。
                userAssistantMessages = [
                  {
                    role: 'assistant',
                    content: compressedText
                  },
                  ...remainingMessages
                ];
              } else {
                logger.warn('InputArea', 'Auto-compression provider not found for model:', autoCompressionModelId);
              }
            }
          } catch (autoCompressError) {
            logger.error('InputArea', 'Auto-compression failed:', autoCompressError);
            // 自动压缩失败不影响正常流程，继续执行
          }
        }
      }

      // 第三步：确保消息列表中包含了当前用户消息（如果尚未包含）
      // 注意：上面的 history 是 getMessages(convId) 的结果。由于 addMessage 已将当前消息入库，
      // 如果 contextLimit 不为 0 且 history 已包含当前消息，则此处无需重复添加。
      // 但为了逻辑严密，我们重新从 userAssistantMessages 构建最终的对话列表。
      
      // 第四步：构建统一的系统消息，合并所有系统级内容
      let finalSystemMessage = null;
      const systemParts = [];
      
      // 1. 添加用户自定义的系统提示词（或默认提示词）
      if (effectivePresets.systemPrompt && effectivePresets.systemPrompt.trim()) {
        systemParts.push(effectivePresets.systemPrompt.trim());
        logger.info('InputArea', 'User system prompt added:', effectivePresets.systemPrompt.substring(0, 50) + '...');
      } else {
        // 如果用户没有配置系统提示词，使用翻译的默认提示词
        const defaultPrompt = t('settings.conversation.promptPlaceholder');
        systemParts.push(defaultPrompt);
        logger.debug('InputArea', 'Using default system prompt from i18n');
      }
      
      // 2. 添加已上传的文档内容
      const documentsContent = getCompletedFilesContent(convId);
      if (documentsContent) {
        systemParts.push('\n\n--- Uploaded Document Content ---\n' + documentsContent);
        logger.info('InputArea', 'Added document content to system message');
      }
      
      // 3. 添加知识库检索的相关文档
      if (activeKnowledgeBase) {
        logger.info('InputArea', 'Knowledge base active, retrieving documents...');
        const retrievedDocs = retrieveDocuments(userMsg, activeKnowledgeBase);
        
        if (retrievedDocs.length > 0) {
          const kbContext = retrievedDocs.map((doc, idx) => 
            `[Document ${idx + 1}] ${doc.documentName}\n${doc.content}\nSimilarity: ${(doc.similarity * 100).toFixed(1)}%`
          ).join('\n\n');
          
          systemParts.push('\n\n--- Knowledge Base Documents ---\n' + kbContext);
          logger.info('InputArea', `Retrieved ${retrievedDocs.length} documents`);
        } else {
          logger.info('InputArea', 'No relevant documents found');
        }
      }
      
      // 4. 根据用户语言偏好添加语言要求指令
      const { general } = useConfigStore.getState();
      const userLanguage = localSettingsData?.language || general.language || 'zh-CN';
      
      // 根据语言设置添加相应的回复语言要求
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
      
      // 5. 合并所有系统消息部分
      if (systemParts.length > 0) {
        finalSystemMessage = {
          role: 'system',
          content: systemParts.join('\n\n')
        };
      }
      
      // 第五步：重组最终发送给模型的消息列表
      const finalMessages = [...userAssistantMessages];
      if (finalSystemMessage) {
        finalMessages.unshift(finalSystemMessage);
      }

      // 添加深度思考指令
      if (isReasoningEnabled) {
        const isNativeThinking = modelConfig?.capabilities?.thinking;
        if (!isNativeThinking) {
          // 使用 <think> 标签更符合 DeepSeek 等模型的原生习惯，也更通用
          const thinkingPrompt = '\n\n--- Reasoning Requirement ---\nPlease think deeply before answering. Put your thought process inside <think> tags, then provide your formal response.';
          if (finalSystemMessage) {
             // 修正：这里应该更新 finalMessages 中的第一项（即 system 消息）
             finalMessages[0].content += thinkingPrompt;
          } else {
            finalMessages.unshift({
              role: 'system',
              content: thinkingPrompt
            });
          }
        }
      }
      
      logger.debug('InputArea', 'Using model:', { providerId: provider.id, modelId });

      // 如果模型不支持多模态，过滤掉消息中的图片内容，将OCR内容合并到文本
      if (!modelConfig?.capabilities?.multimodal) {
        logger.debug('InputArea', 'Non-multimodal model detected, filtering image content and merging OCR');
        finalMessages.forEach((msg, index) => {
          if (Array.isArray(msg.content)) {
            let textContent = '';
            // 如果消息包含OCR内容，优先使用（为了不显示在界面上但发给AI）
            if (msg.ocrContent) {
              const inputText = msg.content.find(part => part.type === 'text')?.text || '';
              // 合并用户输入和OCR识别内容
              if (inputText && inputText.trim()) {
                textContent = inputText + "\n\n" + msg.ocrContent;
              } else {
                // 如果用户没有文本输入，只有图片，则只使用OCR内容
                textContent = msg.ocrContent;
              }
              logger.debug('InputArea', `Message ${index} OCR merged:`, {
                hasUserInput: !!inputText,
                ocrLength: msg.ocrContent.length,
                finalLength: textContent.length
              });
            } else {
              // 没有OCR内容，只提取文本部分
              textContent = msg.content
                .filter(part => part.type === 'text')
                .map(part => part.text)
                .join('\n');
            }
            msg.content = textContent;
          }
        });
        logger.info('InputArea', 'Image content filtered, finalMessages prepared for non-multimodal model');
      }

      let reasoningText = '';
      let thinkingStartTime = Date.now();

      // 如果启用了联网搜索
      if (isSearchEnabled) {
        try {
          const results = await search(userMsg, searchSettings.engine, searchSettings.apiKey);
          if (results && results.length > 0) {
            const searchContext = results.map(r => 
              `Title: ${r.title}\nURL: ${r.url}\nSnippet: ${r.snippet}`
            ).join("\n\n");
            
            // 找到最后一条用户消息并注入搜索结果
            const lastUserMsgIndex = [...finalMessages].reverse().findIndex(m => m.role === 'user');
            if (lastUserMsgIndex !== -1) {
              const actualIndex = finalMessages.length - 1 - lastUserMsgIndex;
              finalMessages[actualIndex].content = `Answer the question based on the following search results:

${searchContext}

Question: ${userMsg}`;
            }
          }
        } catch (searchError) {
          logger.error('InputArea', 'Search failed:', searchError);
        }
      }

      // 创建对话专用的AbortController
      const abortController = new AbortController();
      setAbortController(abortController, convId);
      
      // 准备请求选项
      const requestOptions = {
        max_tokens: effectivePresets.maxTokens || modelConfig?.maxTokens || 4096
      };
      
      if (isReasoningEnabled && modelConfig?.capabilities?.thinking) {
        // Claude 等模型使用 max_thinking_tokens
        requestOptions.max_thinking_tokens = modelConfig.maxThinkingTokens || Math.floor(requestOptions.max_tokens / 2) || 2048;
        
        // OpenAI o1/o3 系列模型使用 reasoning_effort
        const lowerModelId = String(modelId).toLowerCase();
        if (lowerModelId.includes('o1') || lowerModelId.includes('o3')) {
          requestOptions.reasoning_effort = 'medium';
        }

        // Gemini 2.0 系列模型通常不需要额外参数开启思考，但如果未来 API 变更可以添加
      }

      if (effectivePresets.temperature !== null) requestOptions.temperature = effectivePresets.temperature;
      if (effectivePresets.topP !== null) requestOptions.top_p = effectivePresets.topP;
      if (effectivePresets.topK !== null) requestOptions.top_k = effectivePresets.topK;
      if (effectivePresets.frequencyPenalty !== null) requestOptions.frequency_penalty = effectivePresets.frequencyPenalty;
      if (effectivePresets.presencePenalty !== null) requestOptions.presence_penalty = effectivePresets.presencePenalty;
      
      await chatCompletion({
        provider: provider.id,
        model: modelId,
        messages: finalMessages,
        apiKey: provider.apiKey,
        baseUrl: provider.baseUrl,
        proxyConfig: proxy,
        format: provider.format || 'openai',
        options: requestOptions,
        signal: abortController.signal,
        stream: true,
        onStream: (chunk) => {
          if (!chunk) return;
          const state = useChatStore.getState();
          const convState = state.getConversationState(convId);
          const currentStreamingMsg = convState.streamingMessage;
          const newContent = (currentStreamingMsg?.content || '') + chunk;
          
          let extractedReasoning = convState.reasoningContent || '';
          // 兼容性处理：优先使用 onThinking 回调的内容，如果 chunk 中包含 <thinking> 标签则提取
          const thinkingMatch = newContent.match(/<(?:think|thinking)>([\s\S]*?)(?:<\/(?:think|thinking)>|$)/);
          if (thinkingMatch) extractedReasoning = thinkingMatch[1];

          state.setConversationState(convId, {
            streamingMessage: { ...currentStreamingMsg, content: newContent },
            ...(thinkingMatch ? { isReasoning: true, reasoningContent: extractedReasoning } : {})
          });

          state.updateMessageById(assistantMsgId, { 
            content: newContent,
            reasoning: extractedReasoning || undefined
          });
        },
        onThinking: (thinking) => {
          reasoningText += thinking;
          const convState = useChatStore.getState().getConversationState(convId);
          const startTime = convState.reasoningStartTime || Date.now();
          useChatStore.getState().setConversationState(convId, {
            isReasoning: true,
            reasoningContent: reasoningText,
            reasoningStartTime: startTime
          });
        },
        onThinkingEnd: () => {
          useChatStore.getState().setConversationState(convId, {
            isReasoning: false,
            reasoningEndTime: Date.now()
          });
        }
      });
      
      const finalState = useChatStore.getState().getConversationState(convId);
      let finalContent = finalState.streamingMessage?.content || '';
      
      if (!reasoningText && finalContent) {
        const thinkingMatch = finalContent.match(/<thinking>([\s\S]*?)<\/thinking>/);
        if (thinkingMatch) {
          reasoningText = thinkingMatch[1].trim();
          finalContent = finalContent.replace(/<thinking>[\s\S]*?<\/thinking>/, '').trim();
        }
      }
      
      let thinkingTime = null;
      if (reasoningText) {
        const fs = useChatStore.getState().getConversationState(convId);
        if (fs.reasoningEndTime && fs.reasoningStartTime) {
           thinkingTime = ((fs.reasoningEndTime - fs.reasoningStartTime) / 1000).toFixed(1);
        } else {
           thinkingTime = ((Date.now() - thinkingStartTime) / 1000).toFixed(1);
        }
      }

      if (finalContent || reasoningText) {
        await useChatStore.getState().updateMessageById(assistantMsgId, {
          content: finalContent || '',
          reasoning: reasoningText || undefined,
          thinkingTime: thinkingTime || undefined
        });
      }
          
      // AI 生成完成后，设置对话状态
      await setConversationGenerating(convId, false);
          
      // 判断是否需要标记为未读：
      // 只有当 AI 开始生成时用户在查看该对话，但完成时用户已经切换到其他对话，才标记为未读
      if (conversationIdWhenStarted === convId) {
        // AI 开始时用户正在查看这个对话
        const currentConvId = useChatStore.getState().currentConversationId;
        if (currentConvId !== convId) {
          // 但完成时用户已经切换到其他对话了，标记为未读
          await db.conversations.update(convId, { hasUnread: true });
          logger.debug('InputArea', `Conversation ${convId} marked as unread (user switched away during generation)`);
        } else {
          // 用户仍在查看该对话，不标记未读
          logger.debug('InputArea', `Conversation ${convId} not marked as unread (user still viewing)`);
        }
      } else {
        // AI 开始时用户就不在查看这个对话（后台对话），标记为未读
        await db.conversations.update(convId, { hasUnread: true });
        logger.debug('InputArea', `Conversation ${convId} marked as unread (background conversation)`);
      }
      
    } catch (e) {
      logger.error('InputArea', 'Error in handleSend:', e);
      if (e.name === 'AbortError') {
        await addMessage({ role: 'assistant', content: t('inputArea.interrupted') }, convId);
      } else {
        await addMessage({ role: 'assistant', content: `${t('inputArea.error')}${e.message || 'Unknown Error'}` }, convId);
      }
      if (convId === currentConversationId) {
        setIsLoading(false);
        setIsSending(false);
      }
      setConversationState(convId, { isAIGenerating: false, isReasoning: false });
      await setConversationGenerating(convId, false);
      
      // 错误情况下的未读标记逻辑与成功情况相同
      if (conversationIdWhenStarted === convId) {
        const currentConvId = useChatStore.getState().currentConversationId;
        if (currentConvId !== convId) {
          await db.conversations.update(convId, { hasUnread: true });
        }
      } else {
        await db.conversations.update(convId, { hasUnread: true });
      }
    } finally {
      clearAbortController(convId);
      if (convId === currentConversationId) {
        setIsLoading(false);
        setIsSending(false);
      }
      setConversationState(convId, { isAIGenerating: false, streamingMessage: null, isReasoning: false });
      if (convId) await setConversationGenerating(convId, false);
    }
  };

  const nativeCameraRef = useRef(null);

  const handleCamera = async () => {
    if (isMobileDevice() && nativeCameraRef.current) {
      nativeCameraRef.current.click();
    } else {
      setCameraInitialImage(null);
      setShowCamera(true);
    }
  };

  const handleNativeCameraChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert(t('fileUpload.unsupportedType') || 'Unsupported file type');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target.result) {
        setCameraInitialImage(event.target.result);
        setShowCamera(true);
      } else {
        logger.error('InputArea', 'FileReader returned empty result');
      }
    };
    reader.onerror = (err) => {
      logger.error('InputArea', 'FileReader error', err);
      alert(t('inputArea.error') + ': File reading failed');
    };
    reader.readAsDataURL(file);
    
    // Reset input
    e.target.value = '';
  };

  const handlePhotoCaptured = async (dataUrl) => {
    try {
      if (!dataUrl || !dataUrl.startsWith('data:')) {
        throw new Error('Invalid image data format');
      }

      // 替代 fetch(dataUrl) 以提高稳定性，避免 TypeError: Load failed
      const [header, base64Data] = dataUrl.split(',');
      const mimeMatch = header.match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      
      const bstr = atob(base64Data);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      
      const file = new File([u8arr], `photo_${Date.now()}.jpg`, { type: mime });
      
      setPendingImages(prev => [...prev, {
        id: Date.now() + Math.random(),
        data: dataUrl,
        file
      }]);
      logger.info('InputArea', 'Photo captured and processed successfully');
    } catch (err) {
      logger.error('InputArea', 'Failed to process captured photo', err);
      alert(t('inputArea.error') + ': ' + (err.message || 'Image processing failed'));
    }
  };

  const handleFileUpload = () => {
    setShowFileUpload(!showFileUpload);
  };

  /**
   * 手动云端同步
   */
  /**
   * 手动云端同步
   */
  const handleManualSync = async () => {
    const { sessionPassword } = useAuthStore.getState();
    const { cloudSync } = useConfigStore.getState();

    if (!cloudSync?.enabled) {
      alert(t('settings.security.enableCloudSync') || '请先在设置中开启云同步');
      return;
    }

    if (!sessionPassword) {
      alert(t('auth.pleaseLogin'));
      return;
    }

    if (isManualSyncing) return;

    setIsManualSyncing(true);
    setIsSyncSuccess(false);
    setIsSyncError(false);
    try {
      // 真实调用同步服务，执行拉取、合并、推送全流程
      await syncService.syncWithConflictResolution(sessionPassword);
      
      // 显示成功反馈
      setIsSyncSuccess(true);
      setTimeout(() => setIsSyncSuccess(false), 3000); // 3秒后恢复
    } catch (error) {
      logger.error('InputArea', 'Manual sync failed:', error);
      setIsSyncError(true);
      setTimeout(() => setIsSyncError(false), 5000); // 5秒后恢复
      alert(t('settings.security.syncFailed', { error: error.message }));
    } finally {
      setIsManualSyncing(false);
    }
  };
  
  /**
   * 手动对话压缩
   * 用户触发历史消息脱水，将旧对话转化为摘要以节省上下文 Token
   */
  const handleManualCompress = async () => {
    if (!currentConversationId || currentConversationId === 'incognito') {
      logger.warn('InputArea', 'Cannot compress: no conversation or incognito mode');
      return;
    }
    
    // 防止并发和在生成时压缩
    if (isCompressing || currentIsAIGenerating) {
      logger.warn('InputArea', 'Compression blocked: generation or compression in progress');
      return;
    }
    
    setIsCompressing(true);
    
    try {
      logger.info('InputArea', 'Starting manual compression...');
      
      // 获取对话消息
      const compressionData = await compressConversation(currentConversationId);
      
      // 过滤掉已经压缩过的消息，避免重复压缩
      const uncompressedMessages = compressionData.messages.filter(m => !m.isCompressed && !m.isCompressionSummary);
      
      if (uncompressedMessages.length < 3) {
        throw new Error(t('compression.tooFewMessages'));
      }
      
      // 获取压缩模型配置（优先使用对话级设置，然后是全局设置，最后回退到当前对话模型）
      const localSettingsData = await getConversationSettings(currentConversationId);
      let compressionModelId = localSettingsData?.compressionModel || defaultModels.compression;
      
      // 如果没有配置压缩模型，使用当前对话模型作为回退
      if (!compressionModelId && currentModel?.modelId) {
        compressionModelId = currentModel.modelId;
        logger.info('InputArea', 'No compression model configured, using current conversation model:', compressionModelId);
      }
      
      if (!compressionModelId) {
        throw new Error(t('compression.modelNotConfigured'));
      }
      
      // 查找压缩模型的配置
      let compressionProvider = null;
      for (const p of providers) {
        const m = p.models?.find(m => m.id === compressionModelId);
        if (m && p.apiKey) {
          compressionProvider = p;
          break;
        }
      }
      
      // 如果指定的压缩模型不可用，尝试使用当前模型作为回退
      if (!compressionProvider && currentModel?.modelId && currentModel.modelId !== compressionModelId) {
        compressionModelId = currentModel.modelId;
        for (const p of providers) {
          const m = p.models?.find(m => m.id === compressionModelId);
          if (m && p.apiKey) {
            compressionProvider = p;
            break;
          }
        }
      }
      
      if (!compressionProvider) {
        throw new Error(t('compression.providerNotFound'));
      }
      
      logger.info('InputArea', `Using compression model: ${compressionModelId}`);
      
      // 构建需要压缩的消息列表（包含所有未压缩的消息）
      const messagesToCompress = uncompressedMessages;
      
      // 调用 AI 压缩服务
      const compressedContent = await compressMessages({
        messages: messagesToCompress.map(m => ({ 
          role: m.role, 
          content: Array.isArray(m.content) ? m.content.filter(p => p.type === 'text').map(p => p.text).join('\n') : m.content 
        })),
        provider: compressionProvider.id,
        model: compressionModelId,
        apiKey: compressionProvider.apiKey,
        baseUrl: compressionProvider.baseUrl,
        proxyConfig: proxy,
        format: compressionProvider.format || 'openai'
      });
      
      logger.info('InputArea', 'Compression successful, compressed content length:', compressedContent.length);
      
      // 应用压缩结果：标记消息并插入压缩摘要
      const compressedText = `**${t('compression.historySummary')}**\n\n${compressedContent}`;
      
      // 获取需要压缩的消息ID
      const compressedMessageIds = messagesToCompress.map(m => m.id);
      
      await applyCompression(
        currentConversationId,
        compressedText,
        compressedMessageIds
      );
      
      logger.info('InputArea', 'Compression applied to conversation successfully');
      
    } catch (error) {
      logger.error('InputArea', 'Manual compression failed:', error);
      // 使用更温和的方式反馈错误，或者仅在非静默场景下弹出
      alert(`${t('compression.failed')}: ${error.message}`);
    } finally {
      setIsCompressing(false);
    }
  };
  
  const handlePlusMenuOption = (option) => {
    switch (option) {
      case 'providers':
      case 'preset-models':
      case 'web-search':
        window.dispatchEvent(new CustomEvent('open-settings', { detail: { tab: option } }));
        break;
      case 'file-parser':
        setShowFileUpload(true);
        break;
      case 'knowledge-base':
        setShowKBSelector(true);
        break;
      default:
        break;
    }
  };

  const getAllModels = () => {
    const list = [];
    if (!Array.isArray(providers)) return list;
    providers.forEach(p => {
      if (Array.isArray(p.models)) {
        p.models.forEach(m => {
          if (m && m.selected === true) {
             list.push({ ...m, providerName: String(p.name || ''), providerId: String(p.id || '') });
          }
        });
      }
    });
    return list;
  };

  const [expandedProviders, setExpandedProviders] = useState({});

  const toggleProvider = (pid) => {
    const pidStr = String(pid);
    setExpandedProviders(prev => ({ ...prev, [pidStr]: !prev[pidStr] }));
  };

  const getGroupedModels = () => {
    const grouped = {};
    if (!Array.isArray(providers)) return grouped;
    providers.forEach(p => {
      if (Array.isArray(p.models)) {
        const selectedModels = p.models.filter(m => m && m.selected === true);
        if (selectedModels.length > 0) {
          const providerId = String(p.id || 'unknown');
          grouped[providerId] = {
            name: String(p.name || t('inputArea.unnamedProvider')),
            models: selectedModels,
            hasKey: !!p.apiKey
          };
        }
      }
    });
    return grouped;
  };

  // 扁平化模型列表用于 VirtualList，支持搜索
  const flatModelItems = useMemo(() => {
    const grouped = getGroupedModels();
    const entries = Object.entries(grouped);
    const items = [];
    const query = modelSearchQuery.toLowerCase().trim();

    entries.forEach(([pid, group]) => {
      if (!group) return;
      const pidStr = String(pid);

      if (query) {
        // 搜索模式
        const matchingModels = group.models.filter(m => {
          const matchName = (m.name || '').toLowerCase().includes(query);
          const matchId = (m.id || '').toLowerCase().includes(query);
          const matchProvider = (group.name || '').toLowerCase().includes(query);
          return matchName || matchId || matchProvider;
        });

        if (matchingModels.length > 0) {
          items.push({ 
            type: 'provider', 
            id: `provider-${pidStr}`, 
            key: `provider-${pidStr}`, 
            providerId: pidStr, 
            group, 
            isExpanded: true 
          });
          
          matchingModels.forEach(m => {
            items.push({ 
              type: 'model', 
              id: `model-${pidStr}-${m.id}`, 
              key: `model-${pidStr}-${m.id}`, 
              providerId: pidStr, 
              model: m 
            });
          });
        }
      } else {
        // 折叠模式
        const isExpanded = !!expandedProviders[pidStr];
        items.push({ 
          type: 'provider', 
          id: `provider-${pidStr}`, 
          key: `provider-${pidStr}`, 
          providerId: pidStr, 
          group, 
          isExpanded 
        });
        
        if (isExpanded && Array.isArray(group.models)) {
          group.models.forEach(m => {
            if (m) items.push({ 
              type: 'model', 
              id: `model-${pidStr}-${m.id}`, 
              key: `model-${pidStr}-${m.id}`, 
              providerId: pidStr, 
              model: m 
            });
          });
        }
      }
    });
    return items;
  }, [providers, expandedProviders, modelSearchQuery, t]);

  const currentModelData = getAllModels().find(m => 
    String(m.id) === String(currentModel?.modelId) && 
    String(m.providerId) === String(currentModel?.providerId)
  );

  useEffect(() => {
    if (currentModelData) {
      const shouldEnable = currentModelData.capabilities?.thinking === true;
      setIsReasoningEnabled(shouldEnable);
    }
  }, [currentModelData?.providerId, currentModelData?.id, currentModelData?.capabilities?.thinking]);

  const hasOpenPopup = showFileUpload || showKBSelector || showConvSettings || showModelSelector || showCamera;

  return (
    <div 
      className={cn(
        "p-4 bg-background/80 backdrop-blur-md border-t flex-shrink-0 transition-all duration-200",
        // 当不在聊天页面时，隐藏 InputArea 及其所有弹窗
        currentView !== 'chat' ? "hidden" : "",
        hasOpenPopup ? "z-[9999]" : "z-20",
        isDragging && "bg-primary/10 border-primary border-t-2"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm border-2 border-dashed border-primary rounded-t-xl pointer-events-none">
          <div className="flex flex-col items-center gap-2 text-primary animate-bounce">
            <Plus className="w-10 h-10" />
            <span className="text-lg font-bold">{t('fileUpload.dropHint') || 'Drop files here'}</span>
          </div>
        </div>
      )}
      <div className="max-w-4xl mx-auto relative">
        
        {showCamera && (
          <CameraCapture 
            onCapture={handlePhotoCaptured} 
            onClose={() => {
              setShowCamera(false);
              setCameraInitialImage(null);
            }} 
            initialImage={cameraInitialImage}
          />
        )}

        <input
          type="file"
          ref={nativeCameraRef}
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleNativeCameraChange}
        />

        {showFileUpload && (
          <>
            <div className="fixed inset-0 z-[10000]" onClick={() => setShowFileUpload(false)} />
            <div className="absolute bottom-full left-0 mb-4 w-full bg-card border rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 z-[10001]" onClick={(e) => e.stopPropagation()}>
              <div className="p-4 border-b flex items-center justify-between bg-accent/20">
                <span className="text-sm font-black text-primary uppercase tracking-widest">{t('inputArea.uploadDoc')}</span>
                <button onClick={() => setShowFileUpload(false)} className="p-1.5 hover:bg-accent rounded-full transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                <FileUpload conversationId={currentConversationId || 'temp'} onFileUploaded={(file) => logger.info('InputArea', 'File uploaded:', file.name)} />
              </div>
            </div>
          </>
        )}
        
        {showKBSelector && (
          <>
            <div className="fixed inset-0 z-[10000]" onClick={() => setShowKBSelector(false)} />
            <div className="absolute bottom-full left-0 mb-4 w-full animate-in fade-in slide-in-from-bottom-4 duration-300 z-[10001]" onClick={(e) => e.stopPropagation()}>
              <KnowledgeBaseSelector inline={true} onClose={() => setShowKBSelector(false)} onSelectKnowledgeBase={(kb) => logger.info('InputArea', 'Knowledge base selected:', kb?.name)} />
            </div>
          </>
        )}
        
        {showConvSettings && (
          <>
            <div className="fixed inset-0 z-[10000]" onClick={() => setShowConvSettings(false)} />
            <div className="absolute bottom-full left-0 mb-4 w-full max-h-[calc(100vh-160px)] animate-in fade-in slide-in-from-bottom-4 duration-300 z-[10001]" onClick={(e) => e.stopPropagation()}>
              <ConversationSettings inline={true} conversationId={currentConversationId} onClose={() => setShowConvSettings(false)} />
            </div>
          </>
        )}
        
        {showModelSelector && (
          <>
            <div className="fixed inset-0 z-[10000]" onClick={() => {
              setShowModelSelector(false);
              setModelSearchQuery('');
            }} />
            <div className="absolute bottom-full right-0 mb-4 w-80 max-h-[70vh] bg-card border rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 z-[10001]" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-center p-2 border-b bg-accent/20">
                <span className="text-xs font-black text-primary uppercase tracking-widest">{t('inputArea.selectModel')}</span>
              </div>
              
              <div className="p-2 border-b">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    ref={modelSearchInputRef}
                    type="text"
                    placeholder={t('settings.llm.searchModel')}
                    value={modelSearchQuery}
                    onChange={(e) => setModelSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-sm bg-accent/50 rounded-lg border-none focus:ring-1 focus:ring-primary outline-none"
                  />
                  {modelSearchQuery && (
                    <button 
                      onClick={() => setModelSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-muted rounded-full"
                    >
                      <X className="w-3 h-3 text-muted-foreground" />
                    </button>
                  )}
                </div>
              </div>

              {flatModelItems.length === 0 ? (
                <div className="p-8 text-xs text-center text-muted-foreground flex flex-col items-center gap-3">
                  <div className="p-4 bg-accent rounded-2xl"><Cpu className="w-6 h-6 opacity-20" /></div>
                  <span>
                    {modelSearchQuery ? t('sidebar.noMatches') : t('inputArea.noModels')}
                    <br/>
                    {!modelSearchQuery && t('inputArea.configureModels')}
                  </span>
                </div>
              ) : (
                <div className="w-full">
                  <VirtualList 
                    items={flatModelItems} 
                    itemHeight={40} 
                    containerHeight={Math.min(Math.max(flatModelItems.length * 40, 150), 400)} 
                    overscan={3} 
                    className="p-2 custom-scrollbar" 
                    renderItem={(item) => {
                      if (item.type === 'provider') {
                        return (
                          <button onClick={() => toggleProvider(item.providerId)} className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-accent/50 transition-all group h-full">
                            <div className="flex items-center gap-3">
                              <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs transition-colors", item.group.hasKey ? getProviderColors(item.providerId).bg : "bg-accent", item.group.hasKey ? getProviderColors(item.providerId).text : "text-muted-foreground")}>
                                {String(item.group.name || '?').charAt(0).toUpperCase()}
                              </div>
                              <div className="flex flex-col items-start">
                                <span className="text-sm font-bold">{item.group.name}</span>
                                {!item.group.hasKey && <span className="text-[10px] text-destructive font-medium">{t('inputArea.noKey')}</span>}
                              </div>
                            </div>
                            <ChevronDown className={cn("w-4 h-4 opacity-50 transition-transform duration-300", item.isExpanded && "rotate-180")} />
                          </button>
                        );
                      } else {
                        const isSelected = String(currentModel?.modelId) === String(item.model.id) && String(currentModel?.providerId) === item.providerId;
                        return (
                          <div className="pl-11 pr-2 h-full">
                            <button 
                              onClick={() => { 
                                setCurrentModel({ providerId: item.providerId, modelId: String(item.model.id) }); 
                                setShowModelSelector(false); 
                                setModelSearchQuery('');
                              }} 
                              className={cn(
                                "w-full text-left p-1.5 rounded-lg transition-all flex items-center justify-between group/item border border-transparent h-full", 
                                isSelected ? "bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20" : "hover:bg-primary/5 hover:border-primary/20"
                              )}
                            >
                              <div className="flex flex-col gap-0.5 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs truncate">{item.model.name || item.model.id || t('common.unknown')}</span>
                                  <div className="flex gap-1 flex-shrink-0 transform origin-left scale-75">
                                    {item.model.capabilities?.thinking && <Brain className={cn("w-3 h-3", isSelected ? "text-white" : "text-orange-500")} />}
                                    {item.model.capabilities?.multimodal && <Camera className={cn("w-3 h-3", isSelected ? "text-white" : "text-purple-500")} />}
                                    {item.model.capabilities?.imageGen && <ImageIcon className={cn("w-3 h-3", isSelected ? "text-white" : "text-blue-500")} />}
                                    {item.model.capabilities?.tools && <Sparkles className={cn("w-3 h-3", isSelected ? "text-white" : "text-green-500")} />}
                                  </div>
                                </div>
                              </div>
                              {isSelected && <Check className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        );
                      }
                    }} 
                  />
                </div>
              )}
            </div>
          </>
        )}

        <div className="flex flex-col gap-2 bg-white/80 dark:bg-card/80 backdrop-blur-sm rounded-[24px] p-3 border border-border/30 transition-all shadow-lg">
          {/* 顶部功能按钮组：拍照、同步、新对话 */}
          <div className="flex items-center justify-start px-2 py-1 gap-4 text-[10px] font-medium border-b border-border/10 mb-1">
            <button 
              onClick={handleCamera} 
              className="flex items-center gap-1.5 text-muted-foreground/60 hover:text-primary transition-colors py-1 px-2 rounded-lg hover:bg-primary/5"
            >
              <Camera className="w-3.5 h-3.5" /> 
              {t('inputArea.takePhoto')}
            </button>
            
            <button 
              onClick={handleManualSync} 
              disabled={isManualSyncing}
              className={cn(
                "flex items-center gap-1.5 transition-all py-1 px-2 rounded-lg",
                isSyncSuccess ? "text-green-500 bg-green-500/10" : 
                isSyncError ? "text-destructive bg-destructive/10" : 
                "text-muted-foreground/60 hover:text-primary hover:bg-primary/5",
                isManualSyncing && "text-primary opacity-70 cursor-wait"
              )}
            >
              {isSyncSuccess ? (
                <Check className="w-3.5 h-3.5 animate-in zoom-in duration-300" />
              ) : isSyncError ? (
                <AlertCircle className="w-3.5 h-3.5 animate-in shake duration-300" />
              ) : (
                <RefreshCw className={cn("w-3.5 h-3.5", isManualSyncing && "animate-spin")} />
              )}
              <span>
                {isManualSyncing ? t('settings.security.syncStatusSyncing') : 
                 isSyncSuccess ? t('settings.security.syncStatusSuccess') : 
                 isSyncError ? t('settings.security.syncStatusError') :
                 t('inputArea.manualSync')}
              </span>
            </button>
            
            <button 
              onClick={() => createNewConversation()} 
              className="flex items-center gap-1.5 text-muted-foreground/60 hover:text-primary transition-colors py-1 px-2 rounded-lg hover:bg-primary/5"
            >
              <Plus className="w-3.5 h-3.5" /> 
              {t('inputArea.newConversation')}
            </button>
          </div>

          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                if ((!input.trim() && pendingImages.length === 0 && uploadedFiles.length === 0) || isLoading || isSending || !isFilesReady) return;
                setTimeout(() => handleSend(), 0);
              }
            }}
            onPaste={handlePaste}
            placeholder={t('inputArea.placeholderQuestion')}
            className="w-full bg-transparent border-none focus:ring-0 text-base py-3 px-4 resize-none max-h-60 custom-scrollbar min-h-[50px] placeholder:text-muted-foreground/50 text-foreground dark:text-foreground"
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
          />
          
          {/* 文件预览区域 (图片 + 文档) */}
          {(pendingImages.length > 0 || uploadedFiles.length > 0) && (
            <div className="flex gap-2 px-4 py-2 overflow-x-auto custom-scrollbar">
              {/* 待发送图片 */}
              {pendingImages.map((img) => (
                <div key={img.id} className="relative group flex-shrink-0 mt-1">
                  <img 
                    src={img.data} 
                    alt="preview" 
                    className="h-16 w-16 object-cover rounded-lg border border-border cursor-pointer hover:opacity-90 transition-opacity" 
                    onClick={() => setPreviewImage(img.data)}
                  />
                  <button 
                    onClick={() => removePendingImage(img.id)}
                    className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              
              {/* 已上传文档 */}
              {uploadedFiles.map((file) => (
                <div key={file.id} className="relative group flex-shrink-0 w-40 h-16 flex items-center gap-2 bg-accent/30 rounded-lg border border-border p-2 pr-6">
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-background rounded border">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <span className="text-xs font-medium truncate w-full" title={file.name}>{file.name}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {file.status === 'uploading' && 'Uploading...'}
                      {file.status === 'parsing' && 'Parsing...'}
                      {file.status === 'completed' && 'Ready'}
                      {file.status === 'error' && 'Error'}
                    </span>
                  </div>
                  <button 
                    onClick={() => removeFile(file.id)}
                    className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  {/* Progress bar for uploading/parsing */}
                  {(file.status === 'uploading' || file.status === 'parsing') && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-accent rounded-b-lg overflow-hidden">
                       <div className="h-full bg-primary" style={{ width: `${file.progress}%` }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between px-2 pb-1 gap-2">
            <div className="flex items-center gap-1 flex-1 overflow-x-auto min-w-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <input 
                type="file" 
                ref={fileInputRef} 
                accept="*/*" 
                multiple 
                className="hidden" 
                onChange={handleFileSelect} 
              />
              <button onClick={() => fileInputRef.current?.click()} className="p-2.5 rounded-full hover:bg-accent/50 text-muted-foreground hover:text-foreground transition-all active:scale-95 flex-shrink-0" title={t('inputArea.uploadFile')}><Plus className="w-5 h-5" /></button>
              <button onClick={() => setIsSearchEnabled(!isSearchEnabled)} className={cn("p-2.5 rounded-full transition-all active:scale-95 flex-shrink-0", isSearchEnabled ? "bg-blue-500 text-white shadow-md shadow-blue-500/20" : "hover:bg-accent/50 text-muted-foreground hover:text-foreground")} title={t('inputArea.webSearch')}><Globe className="w-5 h-5" /></button>
              <button onClick={() => setIsReasoningEnabled(!isReasoningEnabled)} className={cn("p-2.5 rounded-full transition-all active:scale-95 flex-shrink-0", isReasoningEnabled ? "bg-orange-500/70 text-white" : "hover:bg-accent/50 text-muted-foreground hover:text-foreground")} title={t('inputArea.deepThinking')}><Brain className="w-5 h-5" /></button>
              <button onClick={handleManualCompress} disabled={isCompressing || !currentConversationId || currentConversationId === 'incognito'} className={cn("p-2.5 rounded-full transition-all active:scale-95 flex-shrink-0", isCompressing ? "bg-primary/20 text-primary" : "hover:bg-accent/50 text-muted-foreground hover:text-foreground", "disabled:opacity-30 disabled:cursor-not-allowed")} title={t('inputArea.compressConversation')}>{isCompressing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Minimize2 className="w-5 h-5" />}</button>
              <button onClick={() => setShowKBSelector(true)} className={cn("p-2.5 rounded-full transition-all active:scale-95 flex-shrink-0", activeKnowledgeBase ? "bg-accent/70 text-foreground" : "hover:bg-accent/50 text-muted-foreground hover:text-foreground")} title={t('inputArea.selectKB')}><BookOpen className="w-5 h-5" /></button>
              <button onClick={() => setShowConvSettings(true)} className="p-2.5 rounded-full hover:bg-accent/50 text-muted-foreground hover:text-foreground transition-all active:scale-95 flex-shrink-0" title={t('inputArea.conversationSettings')}><Sliders className="w-5 h-5" /></button>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0 ml-2">
              <button onClick={() => setShowModelSelector(!showModelSelector)} className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 transition-all active:scale-95 group" title={t('inputArea.selectModel')}>
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  {currentModelData?.capabilities?.imageGen ? <ImageIcon className="w-3.5 h-3.5 text-primary-foreground" /> : <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />}
                </div>
                <div className="hidden md:flex flex-col items-start min-w-0">
                  <div className="flex items-center gap-1.5 w-full">
                    <span className="text-sm font-semibold text-foreground max-w-[120px] truncate block">{currentModelData?.name || currentModel?.modelId || t('inputArea.selectModel')}</span>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity hidden md:block" />
              </button>
              <button 
                onClick={() => { if (currentIsAIGenerating) stopAIGeneration(currentConversationId); else handleSend(); }} 
                disabled={currentIsAIGenerating ? false : (
                  isLoading || 
                  isSending || 
                  (!input.trim() && pendingImages.length === 0 && uploadedFiles.length === 0) || 
                  !isFilesReady
                )} 
                className={cn(
                  "p-3 rounded-full disabled:opacity-30 transition-all hover:scale-110 active:scale-95 shadow-lg", 
                  currentIsAIGenerating ? "bg-destructive text-destructive-foreground hover:shadow-destructive/30" : "bg-primary text-primary-foreground hover:shadow-primary/30"
                )} 
                title={currentIsAIGenerating ? t('inputArea.interrupt') : t('inputArea.send')}
              >
                {currentIsAIGenerating ? <Square className="w-5 h-5" /> : (isLoading || !isFilesReady) ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowUp className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
        
      </div>
      
      {previewImage && (
        <ImagePreviewModal src={previewImage} onClose={() => setPreviewImage(null)} />
      )}
    </div>
  );
};

export default InputArea;
