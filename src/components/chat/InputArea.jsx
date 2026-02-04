import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useChatStore } from '../../store/useChatStore';
import { useConfigStore } from '../../store/useConfigStore';
import { useAuthStore } from '../../store/useAuthStore';
import { syncService } from '../../services/syncService';
import { useViewStore } from '../../store/useViewStore';
import { useTranslation } from '../../i18n';
import { useKnowledgeBaseStore } from '../../store/useKnowledgeBaseStore';
import { logger } from '../../services/logger';
import { cn } from '../../utils/cn';
import { isMobileDevice } from '../../utils/envDetect';
import { CHAT_CONFIG } from '../../utils/constants';
import { shallow } from 'zustand/shallow';
import { db } from '../../db';

// Hooks
import { useFileHandler } from './hooks/useFileHandler';
import { useMessageSender } from './hooks/useMessageSender';

// Components
import FileUpload from './FileUpload';
import ConversationSettings from './ConversationSettings';
import KnowledgeBaseSelector from './KnowledgeBaseSelector';
import ImagePreviewModal from '../ui/ImagePreviewModal';
import CameraCapture from './CameraCapture';
import AttachmentArea from './AttachmentArea';
import InputToolbar from './InputToolbar';
import ModelSelectorPopup from './ModelSelectorPopup';

/**
 * 厂商颜色映射逻辑提取
 */
const PROVIDER_BRAND_COLORS = {
  'openai': { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400' },
  'anthropic': { bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400' },
  'google': { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400' },
  'gemini': { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400' },
  'deepseek': { bg: 'bg-cyan-500/10', text: 'text-cyan-600 dark:text-cyan-400' },
  'siliconflow': { bg: 'bg-indigo-500/10', text: 'text-indigo-600 dark:text-indigo-400' },
  'openrouter': { bg: 'bg-violet-500/10', text: 'text-violet-600 dark:text-violet-400' }
};

const getProviderColors = (providerId) => {
  const id = String(providerId).toLowerCase();
  return PROVIDER_BRAND_COLORS[id] || { bg: 'bg-accent', text: 'text-muted-foreground' };
};

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
  const [previewImage, setPreviewImage] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const [isSyncSuccess, setIsSyncSuccess] = useState(false);
  const [isSyncError, setIsSyncError] = useState(false);
  const [modelSearchQuery, setModelSearchQuery] = useState('');
  const fileInputRef = useRef(null);
  const modelSearchInputRef = useRef(null);
  const textareaRef = useRef(null);

  // Stores
  const { 
    createNewConversation, setCurrentModel, setConversationGenerating,
    stopAIGeneration, getConversationSettings, compressConversation, applyCompression 
  } = useChatStore(state => ({
    createNewConversation: state.createNewConversation,
    setCurrentModel: state.setCurrentModel,
    setConversationGenerating: state.setConversationGenerating,
    stopAIGeneration: state.stopAIGeneration,
    getConversationSettings: state.getConversationSettings,
    compressConversation: state.compressConversation,
    applyCompression: state.applyCompression
  }), shallow);

  const currentConversationId = useChatStore(state => state.currentConversationId);
  const currentModel = useChatStore(state => state.currentModel);
  const currentIsAIGenerating = useChatStore(state => state.conversationStates[state.currentConversationId]?.isAIGenerating || false);
  const { providers, defaultModels, proxy } = useConfigStore();
  const { activeKnowledgeBase } = useKnowledgeBaseStore();

  const currentConversation = useLiveQuery(() => currentConversationId ? db.conversations.get(currentConversationId) : null, [currentConversationId]);
  const localSettings = currentConversation?.localSettings || null;

  // Custom Hooks
  const {
    pendingImages, setPendingImages, uploadedFiles, isFilesReady, isDragging,
    handleFileSelect, handlePaste, handleDragOver, handleDragLeave, handleDrop,
    removePendingImage, clearPendingImages, removeFile
  } = useFileHandler(currentConversationId);

  const { handleSend: sendMessage } = useMessageSender({
    currentConversationId, currentModel, isSearchEnabled, isReasoningEnabled,
    input, setInput, setIsLoading, setIsSending, pendingImages,
    clearPendingImages, uploadedFiles, isFilesReady, localSettings
  });

  // Init model
  useEffect(() => {
    if (!currentModel) {
      const defId = defaultModels.chat;
      const active = providers.find(p => p.apiKey && p.models?.length > 0);
      if (defId) {
        for (const p of providers) {
          const m = p.models?.find(m => m.id === defId);
          if (m) { setCurrentModel({ providerId: p.id, modelId: m.id }); return; }
        }
      }
      if (active) setCurrentModel({ providerId: active.id, modelId: (active.models.find(m => m.selected) || active.models[0]).id });
    }
  }, [providers, defaultModels, currentModel, setCurrentModel]);

  useEffect(() => { setIsLoading(false); setIsSending(false); }, [currentConversationId]);

  const currentView = useViewStore(state => state.currentView);
  useEffect(() => { if (showModelSelector) setTimeout(() => modelSearchInputRef.current?.focus(), 50); }, [showModelSelector]);
  useEffect(() => { if (currentView !== 'chat') { setShowModelSelector(false); setShowFileUpload(false); setShowConvSettings(false); setShowKBSelector(false); setShowCamera(false); setPreviewImage(null); } }, [currentView]);

  const handleManualSync = async () => {
    const { sessionPassword } = useAuthStore.getState();
    const { cloudSync } = useConfigStore.getState();
    if (!cloudSync?.enabled || !sessionPassword || isManualSyncing) return;
    setIsManualSyncing(true); setIsSyncSuccess(false); setIsSyncError(false);
    try {
      await syncService.syncWithConflictResolution(sessionPassword);
      setIsSyncSuccess(true); setTimeout(() => setIsSyncSuccess(false), CHAT_CONFIG.SYNC_FEEDBACK_DURATION);
    } catch (error) {
      logger.error('InputArea', 'Manual sync failed', error);
      setIsSyncError(true); setTimeout(() => setIsSyncError(false), CHAT_CONFIG.SYNC_ERROR_DURATION);
    } finally { setIsManualSyncing(false); }
  };

  const handleManualCompress = async () => {
    if (!currentConversationId || currentConversationId === 'incognito' || isCompressing || currentIsAIGenerating) return;
    setIsCompressing(true);
    try {
      const compressionData = await compressConversation(currentConversationId);
      const uncompressed = compressionData.messages.filter(m => !m.isCompressed && !m.isCompressionSummary);
      if (uncompressed.length < 3) throw new Error(t('compression.tooFewMessages'));
      const localData = await getConversationSettings(currentConversationId);
      let mid = localData?.compressionModel || defaultModels.compression || currentModel?.modelId;
      const prov = providers.find(p => p.apiKey && p.models?.some(m => m.id === mid));
      if (!prov) throw new Error(t('compression.providerNotFound'));
      const { compressMessages } = await import('../../services/aiService');
      const content = await compressMessages({ messages: uncompressed.map(m => ({ role: m.role, content: Array.isArray(m.content) ? m.content.filter(p => p.type === 'text').map(p => p.text).join('\n') : m.content })), provider: prov.id, model: mid, apiKey: prov.apiKey, baseUrl: prov.baseUrl, proxyConfig: proxy, format: prov.format || 'openai' });
      await applyCompression(currentConversationId, `**${t('compression.historySummary')}**\n\n${content}`, uncompressed.map(m => m.id));
    } catch (err) { logger.error('Compress fail', err); alert(err.message); } finally { setIsCompressing(false); }
  };

  const [expandedProviders, setExpandedProviders] = useState({});
  const toggleProvider = (pid) => setExpandedProviders(p => ({ ...p, [pid]: !p[pid] }));

  const groupedModels = useMemo(() => {
    const res = {};
    providers.forEach(p => {
      const sel = p.models?.filter(m => m.selected);
      if (sel?.length > 0) res[p.id] = { name: p.name || 'Unknown', models: sel, hasKey: !!p.apiKey };
    });
    return res;
  }, [providers]);

  const flatModelItems = useMemo(() => {
    const items = [];
    const q = modelSearchQuery.toLowerCase().trim();
    Object.entries(groupedModels).forEach(([pid, g]) => {
      const match = g.models.filter(m => (m.name || '').toLowerCase().includes(q) || (m.id || '').toLowerCase().includes(q) || g.name.toLowerCase().includes(q));
      if (match.length > 0) {
        items.push({ type: 'provider', id: pid, providerId: pid, group: g, isExpanded: q ? true : !!expandedProviders[pid] });
        if (q || expandedProviders[pid]) match.forEach(m => items.push({ type: 'model', id: `${pid}-${m.id}`, providerId: pid, model: m }));
      }
    });
    return items;
  }, [groupedModels, expandedProviders, modelSearchQuery]);

  const currentModelData = useMemo(() => {
    for (const p of providers) {
      const m = p.models?.find(m => String(m.id) === String(currentModel?.modelId) && String(p.id) === String(currentModel?.providerId));
      if (m) return { ...m, providerId: p.id };
    }
    return null;
  }, [providers, currentModel]);

  useEffect(() => { if (currentModelData) setIsReasoningEnabled(currentModelData.capabilities?.thinking === true); }, [currentModelData]);

  const nativeCameraRef = useRef(null);
  const handleNativeCameraChange = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader(); reader.onload = (ev) => { setCameraInitialImage(ev.target.result); setShowCamera(true); };
    reader.readAsDataURL(file); e.target.value = '';
  };

  if (currentView !== 'chat') return null;

  return (
    <div 
      className={cn("p-4 bg-background/80 backdrop-blur-md border-t flex-shrink-0 transition-all z-20", isDragging && "bg-primary/10 border-primary border-t-2")}
      onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
    >
      {isDragging && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm border-2 border-dashed border-primary rounded-t-xl pointer-events-none">
          <div className="flex flex-col items-center gap-2 text-primary animate-bounce"><Plus className="w-10 h-10" /><span className="text-lg font-bold">{t('fileUpload.dropHint')}</span></div>
        </div>
      )}
      <div className="max-w-4xl mx-auto relative">
        {showCamera && <CameraCapture onCapture={img => {
          const [h, d] = img.split(','); const m = h.match(/:(.*?);/)[1]; const b = atob(d); let n = b.length; const u = new Uint8Array(n); while (n--) u[n] = b.charCodeAt(n);
          setPendingImages(prev => [...prev, { id: Date.now() + Math.random(), data: img, file: new File([u], `photo_${Date.now()}.jpg`, { type: m }) }]);
        }} onClose={() => setShowCamera(false)} initialImage={cameraInitialImage} />}

        <input type="file" ref={nativeCameraRef} accept="image/*" capture="environment" className="hidden" onChange={handleNativeCameraChange} />

        {showFileUpload && (
          <>
            <div className="fixed inset-0 z-[10000]" onClick={() => setShowFileUpload(false)} />
            <div className="absolute bottom-full left-0 mb-4 w-full bg-card border rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 z-[10001]" onClick={e => e.stopPropagation()}>
              <div className="p-4 border-b flex items-center justify-between bg-accent/20"><span className="text-sm font-black text-primary uppercase">{t('inputArea.uploadDoc')}</span><button onClick={() => setShowFileUpload(false)} className="p-1.5 hover:bg-accent rounded-full"><X className="w-4 h-4" /></button></div>
              <div className="p-4 max-h-[400px] overflow-y-auto custom-scrollbar"><FileUpload conversationId={currentConversationId || 'temp'} /></div>
            </div>
          </>
        )}
        
        {showKBSelector && <div className="absolute bottom-full left-0 mb-4 w-full z-[10001] animate-in fade-in slide-in-from-bottom-4"><KnowledgeBaseSelector inline={true} onClose={() => setShowKBSelector(false)} /></div>}
        {showConvSettings && <div className="absolute bottom-full left-0 mb-4 w-full z-[10001] animate-in fade-in slide-in-from-bottom-4"><ConversationSettings inline={true} conversationId={currentConversationId} onClose={() => setShowConvSettings(false)} /></div>}
        {showModelSelector && <ModelSelectorPopup onClose={() => setShowModelSelector(false)} modelSearchQuery={modelSearchQuery} setModelSearchQuery={setModelSearchQuery} modelSearchInputRef={modelSearchInputRef} flatModelItems={flatModelItems} toggleProvider={toggleProvider} getProviderColors={getProviderColors} currentModel={currentModel} setCurrentModel={setCurrentModel} t={t} />}

        <div className="flex flex-col gap-2 bg-white/80 dark:bg-card/80 backdrop-blur-sm rounded-[24px] p-3 border border-border/30 shadow-lg">
          <div className="flex items-center justify-end px-2 py-1 gap-3 text-[10px] font-medium border-b border-border/10 mb-1">
            <button onClick={() => { if (isMobileDevice() && nativeCameraRef.current) nativeCameraRef.current.click(); else setShowCamera(true); }} className="flex items-center gap-1.5 text-muted-foreground/60 hover:text-primary transition-colors"><Camera className="w-3.5 h-3.5" />{t('inputArea.takePhoto')}</button>
            <button onClick={handleManualSync} disabled={isManualSyncing} className={cn("flex items-center gap-1.5 transition-all", isSyncSuccess ? "text-green-500" : isSyncError ? "text-destructive" : "text-muted-foreground/60 hover:text-primary")}>
              {isSyncSuccess ? <Check className="w-3.5 h-3.5" /> : isSyncError ? <AlertCircle className="w-3.5 h-3.5" /> : <RefreshCw className={cn("w-3.5 h-3.5", isManualSyncing && "animate-spin")} />}
              <span>{isManualSyncing ? t('settings.security.syncStatusSyncing') : isSyncSuccess ? t('settings.security.syncStatusSuccess') : isSyncError ? t('settings.security.syncStatusError') : t('inputArea.manualSync')}</span>
            </button>
            <button onClick={() => createNewConversation()} className="flex items-center gap-1.5 text-muted-foreground/60 hover:text-primary transition-colors"><Plus className="w-3.5 h-3.5" />{t('inputArea.newConversation')}</button>
          </div>

          <textarea
            ref={textareaRef} rows={1} value={input} onChange={e => setInput(e.target.value)} onPaste={handlePaste} placeholder={t('inputArea.placeholderQuestion')}
            className="w-full bg-transparent border-none focus:ring-0 text-base py-3 px-4 resize-none max-h-60 custom-scrollbar min-h-[50px] text-foreground"
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) { e.preventDefault(); sendMessage(); } }}
            onInput={e => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
          />
          
          <AttachmentArea pendingImages={pendingImages} uploadedFiles={uploadedFiles} onRemoveImage={removePendingImage} onRemoveFile={removeFile} onPreviewImage={setPreviewImage} />

          <InputToolbar 
            fileInputRef={fileInputRef} onFileClick={() => fileInputRef.current?.click()} onFileChange={e => handleFileSelect(e, fileInputRef)}
            isSearchEnabled={isSearchEnabled} setIsSearchEnabled={setIsSearchEnabled} isReasoningEnabled={isReasoningEnabled} setIsReasoningEnabled={setIsReasoningEnabled}
            isCompressing={isCompressing} onManualCompress={handleManualCompress} canCompress={currentConversationId && currentConversationId !== 'incognito'}
            activeKnowledgeBase={activeKnowledgeBase} setShowKBSelector={setShowKBSelector} setShowConvSettings={setShowConvSettings} setShowModelSelector={setShowModelSelector}
            currentModelData={currentModelData} currentModel={currentModel} currentIsAIGenerating={currentIsAIGenerating}
            onStopGeneration={() => stopAIGeneration(currentConversationId)} onSendMessage={sendMessage}
            isSendDisabled={isLoading || isSending || (!input.trim() && pendingImages.length === 0 && uploadedFiles.length === 0) || !isFilesReady}
          />
        </div>
      </div>
      {previewImage && <ImagePreviewModal src={previewImage} onClose={() => setPreviewImage(null)} />}
    </div>
  );
};

export default InputArea;
