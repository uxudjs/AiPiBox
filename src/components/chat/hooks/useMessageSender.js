import { useCallback } from 'react';
import { useChatStore } from '../../../store/useChatStore';
import { useConfigStore } from '../../../store/useConfigStore';
import { useKnowledgeBaseStore } from '../../../store/useKnowledgeBaseStore';
import { useFileStore } from '../../../store/useFileStore';
import { chatCompletion, search, compressMessages } from '../../../services/aiService';
import { logger } from '../../../services/logger';
import { CHAT_CONFIG } from '../../../utils/constants';
import { useTranslation } from '../../../i18n';
import { db } from '../../../db';

/**
 * useMessageSender Hook
 * 集中管理 AI 对话的消息构建、流式请求及状态调度逻辑
 */
export const useMessageSender = (params) => {
  const {
    currentConversationId,
    currentModel,
    isSearchEnabled,
    isReasoningEnabled,
    input,
    setInput,
    setIsLoading,
    setIsSending,
    pendingImages,
    clearPendingImages,
    uploadedFiles,
    isFilesReady,
    localSettings
  } = params;

  const { t } = useTranslation();
  
  const { 
    addMessage, 
    createNewConversation, 
    autoRenameConversation, 
    getMessages,
    setConversationState,
    setConversationGenerating,
    stopAIGeneration,
    setAbortController,
    clearAbortController,
    getConversationSettings,
    getMessagesForAI
  } = useChatStore();

  const { 
    providers, 
    defaultModels, 
    proxy, 
    searchSettings, 
    conversationPresets, 
    conversationSettings, 
    getEffectiveModel 
  } = useConfigStore();

  const { 
    getCompletedFilesContent, 
    attachFilesToMessage,
    updateFileConversationId 
  } = useFileStore();

  const { activeKnowledgeBase, retrieveDocuments } = useKnowledgeBaseStore();

  const handleSend = useCallback(async () => {
    logger.info('useMessageSender', 'handleSend called');
      
    if (params.isSending) return;
    if (!isFilesReady) return;
      
    const hasContent = input.trim() || pendingImages.length > 0 || uploadedFiles.length > 0;
    if (!hasContent || params.isLoading) return;
      
    setIsSending(true);
    setIsLoading(true);
    
    let convId = currentConversationId;
    const isNew = !convId;
    
    let shouldRename = isNew;
    if (!shouldRename && convId) {
      const existingMessages = await getMessages(convId);
      if (existingMessages.length === 0) shouldRename = true;
    }

    if (isNew) {
      convId = await createNewConversation(input.slice(0, 20));
      updateFileConversationId('temp', convId);
    }
    
    const conversationIdWhenStarted = currentConversationId;
    setConversationState(convId, { isAIGenerating: true });
    await setConversationGenerating(convId, true);

    let userMsg = input;
    let messageContent = input;
    let ocrContentForMsg = null;
    
    // 图片/OCR 逻辑
    if (pendingImages.length > 0) {
      const activeProviderId = currentModel?.providerId || providers.find(p => p.apiKey)?.id;
      const activeModelId = currentModel?.modelId || defaultModels.chat;
      const providerConfig = providers.find(p => p.id === activeProviderId);
      const modelConfig = providerConfig?.models?.find(m => m.id === activeModelId);
      const isMultimodal = modelConfig?.capabilities?.multimodal;

      if (isMultimodal) {
        messageContent = [
          { type: 'text', text: input },
          ...pendingImages.map(img => ({ type: 'image_url', image_url: { url: img.data } }))
        ];
        clearPendingImages();
      } else {
        const effectiveOCR = getEffectiveModel('ocr');
        const ocrModelConfig = effectiveOCR?.provider?.models?.find(m => m.id === effectiveOCR.modelId);
        const isOCRConfigured = effectiveOCR?.source === 'configured';
        const isOCRSupported = ocrModelConfig?.capabilities?.multimodal;

        if (!effectiveOCR || !isOCRConfigured || !isOCRSupported) {
          await addMessage({ role: 'assistant', content: t('inputArea.ocrNotConfigured') }, convId);
          setIsLoading(false);
          setIsSending(false);
          setConversationState(convId, { isAIGenerating: false });
          await setConversationGenerating(convId, false);
          return;
        }

        try {
          const ocrResults = [];
          for (const img of pendingImages) {
            const ocrResponse = await chatCompletion({
              provider: effectiveOCR.provider.id,
              model: effectiveOCR.modelId,
              messages: [{ role: 'user', content: [{ type: 'text', text: 'Extract text.' }, { type: 'image_url', image_url: { url: img.data } }] }],
              apiKey: effectiveOCR.provider.apiKey,
              baseUrl: effectiveOCR.provider.baseUrl,
              proxyConfig: proxy,
              format: effectiveOCR.provider.format || 'openai',
              stream: false
            });
            ocrResults.push(ocrResponse);
          }
          ocrContentForMsg = `${t('ocr.contextHeader')}\n${t('ocr.contextIntro')}\n\n${ocrResults.join('\n\n')}\n\n${t('ocr.contextFooter')}`;
          messageContent = [
            { type: 'text', text: input },
            ...pendingImages.map(img => ({ type: 'image_url', image_url: { url: img.data } })),
            { type: 'ocr_notice', chatModel: modelConfig?.name || activeModelId }
          ];
          clearPendingImages();
        } catch (ocrError) {
          logger.error('useMessageSender', 'OCR failed', ocrError);
          await addMessage({ role: 'assistant', content: `OCR failed: ${ocrError.message}` }, convId);
          setIsLoading(false);
          setIsSending(false);
          setConversationState(convId, { isAIGenerating: false });
          await setConversationGenerating(convId, false);
          return;
        }
      }
    }

    const userMessagePayload = { role: 'user', content: messageContent };
    if (ocrContentForMsg) userMessagePayload.ocrContent = ocrContentForMsg;
    
    if (uploadedFiles.length > 0) {
      userMessagePayload.files = uploadedFiles.map(f => ({ id: f.id, name: f.name, size: f.size, type: f.type }));
    }

    const msgId = await addMessage(userMessagePayload, convId);
    if (uploadedFiles.length > 0 && msgId) {
      attachFilesToMessage(uploadedFiles.map(f => f.id), msgId);
    }

    setInput('');
    if (shouldRename) {
      setTimeout(() => {
        autoRenameConversation(convId, userMsg, { providers, defaultModels, proxy })
          .catch(err => logger.error('useMessageSender', 'Auto-rename error', err));
      }, CHAT_CONFIG.AUTO_RENAME_DELAY);
    }

    try {
      const localSettingsData = await getConversationSettings(convId);
      const effectivePresets = { ...conversationPresets };
      if (localSettingsData) {
        Object.keys(localSettingsData).forEach(key => {
          if (localSettingsData[key] !== null && effectivePresets.hasOwnProperty(key)) {
            effectivePresets[key] = localSettingsData[key];
          }
        });
      }
      
      const history = await getMessagesForAI(convId);
      const currentMessages = await getMessages(convId);
      const parentId = currentMessages.length > 0 ? currentMessages[currentMessages.length - 1].id : null;

      let provider, modelId, modelConfig;
      if (currentModel) {
        provider = providers.find(p => p.id === currentModel.providerId);
        modelId = currentModel.modelId;
      } else {
        provider = providers.find(p => p.apiKey);
        modelId = defaultModels.chat;
      }
      if (provider) modelConfig = provider.models?.find(m => m.id === modelId);

      const taskId = crypto.randomUUID();

      if (!provider || !provider.apiKey) {
        await addMessage({ role: 'assistant', content: t('inputArea.configureModels') }, convId);
        setIsLoading(false);
        setIsSending(false);
        setConversationState(convId, { isAIGenerating: false });
        await setConversationGenerating(convId, false);
        return;
      }

      const assistantMsgId = await addMessage({ 
        role: 'assistant', 
        content: '', 
        model: modelId, 
        thinkingTime: null,
        status: 'generating',
        taskId: taskId
      }, convId, parentId);
      
      setConversationState(convId, {
        isAIGenerating: true,
        streamingMessage: { id: assistantMsgId, parentId, role: 'assistant', content: '', conversationId: convId, model: modelId, taskId: taskId },
        isReasoning: false,
        reasoningContent: '',
        reasoningStartTime: null,
        reasoningEndTime: null
      });

      let messages = history.filter(m => !m.id || m.id !== assistantMsgId).map(m => ({
        role: m.role,
        content: m.content,
        ...(m.ocrContent ? { ocrContent: m.ocrContent } : {})
      }));

      // 处理上下文限制/压缩
      let userAssistantMessages = messages.filter(m => m.role !== 'system');
      if (effectivePresets.contextLimit !== null && userAssistantMessages.length > effectivePresets.contextLimit) {
        if (effectivePresets.contextLimit === 0) {
          userAssistantMessages = [];
        } else {
          const excessCount = userAssistantMessages.length - effectivePresets.contextLimit;
          let compressionModelId = localSettingsData?.compressionModel || defaultModels.compression || currentModel?.modelId;
          const compressionProvider = providers.find(p => p.apiKey && p.models?.some(m => m.id === compressionModelId));
          
          if (compressionProvider) {
            try {
              const messagesToCompress = userAssistantMessages.slice(0, excessCount);
              const remainingMessages = userAssistantMessages.slice(excessCount);
              const compressedContent = await compressMessages({
                messages: messagesToCompress,
                provider: compressionProvider.id,
                model: compressionModelId,
                apiKey: compressionProvider.apiKey,
                baseUrl: compressionProvider.baseUrl,
                proxyConfig: proxy,
                format: compressionProvider.format || 'openai'
              });
              userAssistantMessages = [{ role: 'assistant', content: `[${t('compression.historySummary')}] ${compressedContent}` }, ...remainingMessages];
            } catch (err) {
              userAssistantMessages = userAssistantMessages.slice(-effectivePresets.contextLimit);
            }
          } else {
            userAssistantMessages = userAssistantMessages.slice(-effectivePresets.contextLimit);
          }
        }
      }

      // 构建系统提示
      const systemParts = [effectivePresets.systemPrompt || t('settings.conversation.promptPlaceholder')];
      const docContent = getCompletedFilesContent(convId);
      if (docContent) systemParts.push(`\n\n--- Uploaded Documents ---\n${docContent}`);
      if (activeKnowledgeBase) {
        const retrievedDocs = retrieveDocuments(userMsg, activeKnowledgeBase);
        if (retrievedDocs.length > 0) {
          systemParts.push('\n\n--- Knowledge Base ---\n' + retrievedDocs.map(d => `[${d.documentName}]\n${d.content}`).join('\n\n'));
        }
      }
      
      const userLang = localSettingsData?.language || useConfigStore.getState().general.language || 'zh-CN';
      const langPrompts = {
        'zh-CN': '\n\n请使用简体中文回复。不要使用繁体字和港台用语',
        'zh-TW': '\n\n請使用繁體中文回覆。使用台灣地區的用語習慣',
        'en-US': '\n\nPlease respond in English',
        'ja-JP': '\n\n日本語で回答してください',
        'ko-KR': '\n\n한국어로 답변해 주세요'
      };
      if (langPrompts[userLang]) systemParts.push(langPrompts[userLang]);

      const finalMessages = [{ role: 'system', content: systemParts.join('\n\n') }, ...userAssistantMessages];

      if (isReasoningEnabled && !modelConfig?.capabilities?.thinking) {
        finalMessages[0].content += '\n\n--- Reasoning Requirement ---\nPlease think deeply. Put thought process inside <think> tags.';
      }

      // 处理多模态过滤
      if (!modelConfig?.capabilities?.multimodal) {
        finalMessages.forEach(msg => {
          if (Array.isArray(msg.content)) {
            const textPart = msg.content.find(p => p.type === 'text')?.text || '';
            msg.content = msg.ocrContent ? `${textPart}\n\n${msg.ocrContent}` : textPart;
          }
        });
      }

      // 联网搜索
      if (isSearchEnabled) {
        try {
          const results = await search(userMsg, searchSettings.engine, searchSettings.apiKey);
          if (results?.length > 0) {
            const lastUserIdx = [...finalMessages].reverse().findIndex(m => m.role === 'user');
            if (lastUserIdx !== -1) {
              const idx = finalMessages.length - 1 - lastUserIdx;
              finalMessages[idx].content = `Search results:\n\n${results.map(r => r.snippet).join('\n')}\n\nQuestion: ${userMsg}`;
            }
          }
        } catch (err) { logger.error('Search error', err); }
      }

      const abortController = new AbortController();
      setAbortController(abortController, convId);

      let reasoningText = '';
      let thinkingStartTime = Date.now();

      await chatCompletion({
        provider: provider.id,
        model: modelId,
        messages: finalMessages,
        apiKey: provider.apiKey,
        baseUrl: provider.baseUrl,
        proxyConfig: proxy,
        format: provider.format || 'openai',
        taskId: taskId,
        options: {
          max_tokens: effectivePresets.maxTokens || modelConfig?.maxTokens || 4096,
          temperature: effectivePresets.temperature,
          top_p: effectivePresets.topP,
          top_k: effectivePresets.topK,
          frequency_penalty: effectivePresets.frequencyPenalty,
          presence_penalty: effectivePresets.presencePenalty,
          ...(isReasoningEnabled && modelConfig?.capabilities?.thinking ? {
            max_thinking_tokens: modelConfig.maxThinkingTokens || 2048,
            ...(String(modelId).toLowerCase().includes('o1') || String(modelId).toLowerCase().includes('o3') ? { reasoning_effort: 'medium' } : {})
          } : {})
        },
        signal: abortController.signal,
        stream: true,
        onStream: (chunk) => {
          const state = useChatStore.getState();
          const currentStreamingMsg = state.getConversationState(convId).streamingMessage;
          const newContent = (currentStreamingMsg?.content || '') + chunk;
          const thinkingMatch = newContent.match(/<(?:think|thinking)>([\s\S]*?)(?:<\/(?:think|thinking)>|$)/);
          state.setConversationState(convId, {
            streamingMessage: { ...currentStreamingMsg, content: newContent },
            ...(thinkingMatch ? { isReasoning: true, reasoningContent: thinkingMatch[1] } : {})
          });
          state.updateMessageById(assistantMsgId, { content: newContent, reasoning: thinkingMatch ? thinkingMatch[1] : undefined });
        },
        onThinking: (thinking) => {
          reasoningText += thinking;
          const s = useChatStore.getState();
          const startTime = s.getConversationState(convId).reasoningStartTime || Date.now();
          s.setConversationState(convId, { isReasoning: true, reasoningContent: reasoningText, reasoningStartTime: startTime });
        },
        onThinkingEnd: () => {
          useChatStore.getState().setConversationState(convId, { isReasoning: false, reasoningEndTime: Date.now() });
        }
      });

      // 收尾工作
      const finalState = useChatStore.getState().getConversationState(convId);
      let finalContent = finalState.streamingMessage?.content || '';
      if (!reasoningText && finalContent.includes('<thinking>')) {
        const m = finalContent.match(/<thinking>([\s\S]*?)<\/thinking>/);
        if (m) {
          reasoningText = m[1].trim();
          finalContent = finalContent.replace(/<thinking>[\s\S]*?<\/thinking>/, '').trim();
        }
      }
      
      const fs = useChatStore.getState().getConversationState(convId);
      const thinkingTime = reasoningText ? ((fs.reasoningEndTime || Date.now()) - (fs.reasoningStartTime || thinkingStartTime)) / 1000 : null;

      await useChatStore.getState().updateMessageById(assistantMsgId, {
        content: finalContent,
        reasoning: reasoningText || undefined,
        thinkingTime: thinkingTime ? thinkingTime.toFixed(1) : undefined,
        status: 'completed'
      });
      
      await setConversationGenerating(convId, false);
      if (conversationIdWhenStarted !== convId || useChatStore.getState().currentConversationId !== convId) {
        await db.conversations.update(convId, { hasUnread: true });
      }
      
    } catch (e) {
      logger.error('handleSend error', e);
      const content = e.name === 'AbortError' ? t('inputArea.interrupted') : `${t('inputArea.error')}${e.message || 'Unknown Error'}`;
      await addMessage({ role: 'assistant', content }, convId);
      if (conversationIdWhenStarted !== convId || useChatStore.getState().currentConversationId !== convId) {
        await db.conversations.update(convId, { hasUnread: true });
      }
    } finally {
      clearAbortController(convId);
      setIsLoading(false);
      setIsSending(false);
      setConversationState(convId, { isAIGenerating: false, streamingMessage: null, isReasoning: false });
      await setConversationGenerating(convId, false);
    }
  }, [params, addMessage, createNewConversation, autoRenameConversation, getMessages, setConversationState, setConversationGenerating, stopAIGeneration, setAbortController, clearAbortController, getConversationSettings, getMessagesForAI, providers, defaultModels, proxy, searchSettings, conversationPresets, conversationSettings, getEffectiveModel, getCompletedFilesContent, attachFilesToMessage, updateFileConversationId, activeKnowledgeBase, retrieveDocuments, t]);

  return { handleSend };
};
