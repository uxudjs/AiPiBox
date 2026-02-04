import React, { useRef } from 'react';
import { Plus, Globe, Brain, Minimize2, BookOpen, Sliders, Image as ImageIcon, Sparkles, ChevronDown, Square, Loader2, ArrowUp } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useTranslation } from '../../i18n';

/**
 * InputToolbar - 底部工具栏组件
 * 包含附件上传、搜索、深度思考、压缩、知识库、对话设置及模型选择/发送按钮
 */
const InputToolbar = ({
  fileInputRef,
  onFileClick,
  onFileChange,
  isSearchEnabled,
  setIsSearchEnabled,
  isReasoningEnabled,
  setIsReasoningEnabled,
  isCompressing,
  onManualCompress,
  canCompress,
  activeKnowledgeBase,
  setShowKBSelector,
  setShowConvSettings,
  setShowModelSelector,
  currentModelData,
  currentModel,
  currentIsAIGenerating,
  onStopGeneration,
  onSendMessage,
  isLoading,
  isSendDisabled
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between px-2 pb-1 gap-2">
      {/* 左侧功能按钮组 */}
      <div className="flex items-center gap-1 flex-1 overflow-x-auto min-w-0 scrollbar-hide">
        <input 
          type="file" 
          ref={fileInputRef} 
          accept="*/*" 
          multiple 
          className="hidden" 
          onChange={onFileChange} 
        />
        
        <button 
          onClick={onFileClick} 
          className="p-2.5 rounded-full hover:bg-accent/50 text-muted-foreground transition-all active:scale-95 flex-shrink-0"
          title={t('inputArea.uploadFile')}
        >
          <Plus className="w-5 h-5" />
        </button>

        <button 
          onClick={() => setIsSearchEnabled(!isSearchEnabled)} 
          className={cn(
            "p-2.5 rounded-full transition-all active:scale-95 flex-shrink-0", 
            isSearchEnabled ? "bg-blue-500 text-white" : "hover:bg-accent/50 text-muted-foreground"
          )}
          title={t('inputArea.webSearch')}
        >
          <Globe className="w-5 h-5" />
        </button>

        <button 
          onClick={() => setIsReasoningEnabled(!isReasoningEnabled)} 
          className={cn(
            "p-2.5 rounded-full transition-all active:scale-95 flex-shrink-0", 
            isReasoningEnabled ? "bg-orange-500/70 text-white" : "hover:bg-accent/50 text-muted-foreground"
          )}
          title={t('inputArea.deepThinking')}
        >
          <Brain className="w-5 h-5" />
        </button>

        <button 
          onClick={onManualCompress} 
          disabled={!canCompress || isCompressing}
          className={cn(
            "p-2.5 rounded-full transition-all active:scale-95 flex-shrink-0", 
            isCompressing ? "bg-primary/20 text-primary" : "hover:bg-accent/50 text-muted-foreground",
            (!canCompress || isCompressing) && "opacity-30 cursor-not-allowed"
          )}
          title={t('inputArea.compressConversation')}
        >
          <Minimize2 className="w-5 h-5" />
        </button>

        <button 
          onClick={() => setShowKBSelector(true)} 
          className={cn(
            "p-2.5 rounded-full transition-all active:scale-95 flex-shrink-0", 
            activeKnowledgeBase ? "bg-accent/70" : "hover:bg-accent/50 text-muted-foreground"
          )}
          title={t('inputArea.selectKB')}
        >
          <BookOpen className="w-5 h-5" />
        </button>

        <button 
          onClick={() => setShowConvSettings(true)} 
          className="p-2.5 rounded-full hover:bg-accent/50 text-muted-foreground transition-all active:scale-95 flex-shrink-0"
          title={t('inputArea.conversationSettings')}
        >
          <Sliders className="w-5 h-5" />
        </button>
      </div>

      {/* 右侧：模型选择器与发送按钮 */}
      <div className="flex items-center gap-3 flex-shrink-0 ml-2">
        <button 
          onClick={() => setShowModelSelector(true)} 
          className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 transition-all active:scale-95 group"
          title={t('inputArea.selectModel')}
        >
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 text-white">
            {currentModelData?.capabilities?.imageGen ? <ImageIcon className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
          </div>
          <div className="hidden md:flex flex-col items-start min-w-0">
            <span className="text-sm font-semibold text-foreground max-w-[120px] truncate">
              {currentModelData?.name || currentModel?.modelId || t('inputArea.selectModel')}
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 hidden md:block" />
        </button>

        <button 
          onClick={currentIsAIGenerating ? onStopGeneration : onSendMessage} 
          disabled={!currentIsAIGenerating && isSendDisabled}
          className={cn(
            "p-3 rounded-full disabled:opacity-30 transition-all hover:scale-110 active:scale-95 shadow-lg", 
            currentIsAIGenerating ? "bg-destructive text-destructive-foreground hover:shadow-destructive/30" : "bg-primary text-primary-foreground hover:shadow-primary/30"
          )} 
          title={currentIsAIGenerating ? t('inputArea.interrupt') : t('inputArea.send')}
        >
          {currentIsAIGenerating ? (
            <Square className="w-5 h-5" />
          ) : isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <ArrowUp className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
};

export default InputToolbar;
