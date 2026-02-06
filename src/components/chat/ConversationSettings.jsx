import React, { useState, useEffect } from 'react';
import { X, RotateCcw, Save, Info } from 'lucide-react';
import { useChatStore } from '../../store/useChatStore';
import { useConfigStore } from '../../store/useConfigStore';
import { cn } from '../../utils/cn';
import { useTranslation } from '../../i18n';
import { logger } from '../../services/logger';

/**
 * ConversationSettings - 对话级局部设置组件
 * 允许用户为当前对话设置独立的配置（优先级高于全局设置）
 */
const ConversationSettings = ({ conversationId, onClose, inline = false }) => {
  const { t } = useTranslation();
  const { getConversationSettings, updateConversationSettings, resetConversationSettings } = useChatStore();
  const { conversationPresets: globalPresets } = useConfigStore();
  
  // 本地状态
  const [localSettings, setLocalSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 加载对话设置
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        const settings = await getConversationSettings(conversationId);
        setLocalSettings(settings || {
          systemPrompt: null,
          contextLimit: null,
          temperature: null,
          topP: null,
          topK: null,
          frequencyPenalty: null,
          presencePenalty: null,
          maxTokens: null,
          compressionModel: null,
          language: null,
          stream: null,
          showWordCount: null,
          showTokenUsage: null,
          showModelName: null
        });
      } catch (error) {
        logger.error('ConversationSettings', 'Failed to load conversation settings', error);
        setLocalSettings({
          systemPrompt: null,
          contextLimit: null,
          temperature: null,
          topP: null,
          topK: null,
          frequencyPenalty: null,
          presencePenalty: null,
          maxTokens: null,
          compressionModel: null,
          language: null,
          stream: null,
          showWordCount: null,
          showTokenUsage: null,
          showModelName: null
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, [conversationId, getConversationSettings]);

  // 更新设置
  const updateSetting = (key, value) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  // 保存设置
  const handleSave = async () => {
    if (!localSettings) return;
    await updateConversationSettings(conversationId, localSettings);
    if (!conversationId) {
      alert(t('conversationSettings.saveSuccess'));
    }
    onClose();
  };

  // 重置为全局设置
  const handleReset = async () => {
    if (confirm(t('conversationSettings.resetConfirm'))) {
      const resetSettings = {
        systemPrompt: null,
        contextLimit: null,
        temperature: null,
        topP: null,
        topK: null,
        frequencyPenalty: null,
        presencePenalty: null,
        maxTokens: null,
        compressionModel: null,
        language: null,
        stream: null,
        showWordCount: null,
        showTokenUsage: null,
        showModelName: null
      };
      if (conversationId) {
        await resetConversationSettings(conversationId);
      } else {
        await updateConversationSettings(null, resetSettings);
      }
      setLocalSettings(resetSettings);
    }
  };

  if (isLoading || !localSettings) {
    return inline ? (
      <div className="bg-card rounded-3xl p-4 w-full shadow-2xl border">
        <div className="text-center text-sm">{t('conversationSettings.loading')}</div>
      </div>
    ) : (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]" onClick={onClose}>
        <div className="bg-card rounded-3xl p-6 w-full max-w-2xl mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
          <div className="text-center">{t('conversationSettings.loading')}</div>
        </div>
      </div>
    );
  }

  const settingsContent = (
    <>
      {/* 标题栏 */}
      <div className="flex items-center justify-end p-2 border-b bg-accent/20">
        <div className="flex items-center gap-1">
          <button
            onClick={handleReset}
            className="p-1.5 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground"
            title={t('conversationSettings.resetToGlobal')}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-accent rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 设置内容 */}
      <div className="space-y-4 flex-1 overflow-y-auto p-4 min-h-0 custom-scrollbar">
          {/* 提示 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-sm font-bold">{t('conversationSettings.promptLabel')}</label>
              {localSettings.systemPrompt !== null && (
                <span className="text-[10px] text-primary font-bold">{t('conversationSettings.custom')}</span>
              )}
            </div>
            <textarea
              value={localSettings.systemPrompt !== null ? localSettings.systemPrompt : (globalPresets.systemPrompt || '')}
              onChange={(e) => updateSetting('systemPrompt', e.target.value === (globalPresets.systemPrompt || '') ? null : e.target.value)}
              placeholder={t('settings.conversation.promptPlaceholder')}
              className="w-full px-3 py-2 bg-accent/30 rounded-xl border border-border/50 focus:ring-1 focus:ring-primary focus:border-primary text-sm min-h-[80px] resize-none"
            />
          </div>

          {/* 上下文消息数量限制 */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <label className="text-sm font-bold">{t('conversationSettings.messageLimit')}</label>
              {localSettings.contextLimit !== null && (
                <span className="text-[10px] text-primary font-bold">{t('conversationSettings.custom')}</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="66"
                step="1"
                value={localSettings.contextLimit !== null ? localSettings.contextLimit : (globalPresets.contextLimit === null ? 66 : globalPresets.contextLimit)}
                onChange={(e) => {
                  const numValue = parseInt(e.target.value);
                  updateSetting('contextLimit', numValue === 66 ? null : numValue);
                }}
                className="flex-1 h-1 bg-accent/50 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <span className="text-sm font-bold min-w-[35px] text-right">
                {localSettings.contextLimit !== null 
                  ? (localSettings.contextLimit === 66 ? t('conversationSettings.unlimited') : localSettings.contextLimit) 
                  : (globalPresets.contextLimit === null ? t('conversationSettings.unlimited') : globalPresets.contextLimit)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* 温度 */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <label className="text-sm font-bold">{t('conversationSettings.temperature')}</label>
                {localSettings.temperature !== null && (
                  <span className="text-[10px] text-primary font-bold">{t('conversationSettings.custom')}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="-0.1"
                  max="2"
                  step="0.1"
                  value={localSettings.temperature !== null ? localSettings.temperature : (globalPresets.temperature !== null ? globalPresets.temperature : -0.1)}
                  onChange={(e) => {
                    const numValue = parseFloat(e.target.value);
                    updateSetting('temperature', numValue < 0 ? null : numValue);
                  }}
                  className="flex-1 h-1 bg-accent/50 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <span className="text-sm font-bold min-w-[25px] text-right">
                  {localSettings.temperature !== null 
                    ? localSettings.temperature.toFixed(1) 
                    : (globalPresets.temperature !== null ? globalPresets.temperature.toFixed(1) : t('conversationSettings.notSet'))}
                </span>
              </div>
            </div>

            {/* Top P */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <label className="text-sm font-bold">{t('conversationSettings.topP')}</label>
                {localSettings.topP !== null && (
                  <span className="text-[10px] text-primary font-bold">{t('conversationSettings.custom')}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="-0.05"
                  max="1"
                  step="0.05"
                  value={localSettings.topP !== null ? localSettings.topP : (globalPresets.topP !== null ? globalPresets.topP : -0.05)}
                  onChange={(e) => {
                    const numValue = parseFloat(e.target.value);
                    updateSetting('topP', numValue < 0 ? null : numValue);
                  }}
                  className="flex-1 h-1 bg-accent/50 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <span className="text-sm font-bold min-w-[25px] text-right">
                  {localSettings.topP !== null 
                    ? localSettings.topP.toFixed(2) 
                    : (globalPresets.topP !== null ? globalPresets.topP.toFixed(2) : t('conversationSettings.notSet'))}
                </span>
              </div>
            </div>
          </div>
        </div>

      {/* 底部按钮 */}
      <div className="flex gap-2 p-4 border-t bg-accent/10">
        <button
          onClick={onClose}
          className="flex-1 py-2 bg-accent rounded-xl hover:bg-accent/80 transition-colors text-sm font-medium"
        >
          {t('conversationSettings.cancel')}
        </button>
        <button
          onClick={handleSave}
          className="flex-1 py-2 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-colors text-sm font-medium"
        >
          {t('conversationSettings.saveSettings')}
        </button>
      </div>
    </>
  );

  return inline ? (
    <div className="bg-card rounded-3xl shadow-2xl w-full border overflow-hidden flex flex-col max-h-full" onClick={(e) => e.stopPropagation()}>
      {settingsContent}
    </div>
  ) : (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]" onClick={onClose}>
      <div 
        className="bg-card rounded-3xl w-full max-w-2xl mx-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {settingsContent}
      </div>
    </div>
  );
};

export default ConversationSettings;