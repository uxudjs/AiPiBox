import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../i18n';
import { useImageGenStore } from '../../store/useImageGenStore';
import { useConfigStore, getAliyunRegionUrl } from '../../store/useConfigStore';
import { useViewStore } from '../../store/useViewStore';
import { generateImage } from '../../services/aiService';
import { logger } from '../../services/logger';
import { cn } from '../../utils/cn';
import { 
  ImageIcon, 
  Send, 
  Loader2, 
  Settings2, 
  History, 
  Sparkles,
  RefreshCw,
  AlertCircle,
  Upload,
  X as CloseIcon
} from 'lucide-react';
import ModelSelector from './ModelSelector';
import ParameterPanel from './ParameterPanel';
import ImageGallery from './ImageGallery';
import ModeTabs from './ModeTabs';

const ImageFactory = () => {
  const { t } = useTranslation();
  const { 
    mode, 
    params, 
    currentModel, 
    isGenerating, 
    error,
    updateParams, 
    setGenerating, 
    setError,
    saveImage,
    loadHistory
  } = useImageGenStore();
  
  const { providers, proxy } = useConfigStore();
  const [showParams, setShowParams] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  // 监听页面切换，自动关闭参数面板抽屉（移动端）
  const currentView = useViewStore(state => state.currentView);
  useEffect(() => {
    if (currentView !== 'image-factory') {
      // 切换到非图片工厂页面时，关闭参数面板抽屉
      setShowParams(false);
    }
  }, [currentView]);

  const handleGenerate = async () => {
    if (!params.prompt.trim()) return;
    
    const provider = providers.find(p => p.id === currentModel.providerId);
    if (!provider || !provider.apiKey) {
      setError(t('inputArea.noKey'));
      return;
    }

    setGenerating(true);
    setError(null);
    
    try {
      const imageUrls = await generateImage({
        provider: provider.id,
        model: currentModel.modelId,
        prompt: params.prompt,
        negativePrompt: params.negativePrompt,
        apiKey: provider.apiKey,
        baseUrl: getAliyunRegionUrl(provider),
        options: params,
        proxyConfig: proxy,
        format: provider.format
      });

      for (const url of imageUrls) {
        await saveImage({
          providerId: provider.id,
          modelId: currentModel.modelId,
          prompt: params.prompt,
          negativePrompt: params.negativePrompt,
          imageUrl: url,
          width: params.width,
          height: params.height,
          seed: params.seed,
          steps: params.steps,
          cfgScale: params.cfgScale,
          mode
        });
      }
    } catch (e) {
      logger.error('ImageFactory', 'Generation failed', e);
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-background animate-in fade-in duration-500">
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧主要区域 */}
        <div className="flex-1 flex flex-col overflow-hidden border-r relative">
          {/* 模式切换与模型选择 */}
          <div className="p-4 border-b bg-card flex flex-col sm:flex-row items-center justify-between gap-4 z-20">
            <ModeTabs />
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex-1 sm:flex-initial">
                <ModelSelector />
              </div>
              <button 
                onClick={() => setShowParams(!showParams)}
                className={cn(
                  "p-2.5 rounded-xl transition-all lg:hidden flex-shrink-0 border",
                  showParams 
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" 
                    : "bg-accent/50 text-muted-foreground hover:bg-accent border-transparent"
                )}
              >
                <Settings2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 内容输入与生成区 */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* 输入框 */}
              <div className="space-y-4">
                {/* 图生图上传区域 */}
                {mode === 'image-to-image' && (
                  <div className="space-y-2 animate-in slide-in-from-top-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">
                      {t('imageFactory.referenceImage')}
                    </label>
                    <div className="relative group/upload h-64 bg-accent/20 rounded-2xl border-2 border-dashed border-accent/50 hover:border-primary/50 transition-all flex items-center justify-center overflow-hidden">
                      {params.image ? (
                        <>
                          <img src={params.image} className="w-full h-full object-contain" />
                          <button 
                            onClick={() => updateParams({ image: null })}
                            className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-all"
                          >
                            <CloseIcon className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <Upload className="w-8 h-8 opacity-40" />
                          <span className="text-sm font-medium">{t('imageFactory.uploadHint')}</span>
                          <input 
                            type="file" 
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (ev) => updateParams({ image: ev.target.result });
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="relative group">
                  <textarea
                    value={params.prompt}
                    onChange={(e) => updateParams({ prompt: e.target.value })}
                    placeholder={t('imageFactory.promptPlaceholder')}
                    className="w-full h-32 py-3 px-4 bg-accent/30 rounded-2xl border-2 border-transparent focus:border-primary/30 focus:ring-0 transition-all resize-none text-base"
                  />
                  <div className="absolute bottom-3 right-3 flex gap-2">
                    <button 
                      onClick={handleGenerate}
                      disabled={isGenerating || !params.prompt.trim()}
                      className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-xl font-bold hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-primary/20 active:scale-95"
                    >
                      {isGenerating ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Sparkles className="w-5 h-5" />
                      )}
                      {t('imageFactory.generate')}
                    </button>
                  </div>
                </div>

                {/* 反向提示词 */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">
                    {t('imageFactory.negativePrompt')}
                  </label>
                  <input
                    type="text"
                    value={params.negativePrompt}
                    onChange={(e) => updateParams({ negativePrompt: e.target.value })}
                    placeholder={t('imageFactory.negativePromptPlaceholder')}
                    className="w-full py-3 px-4 bg-accent/30 rounded-xl border-none focus:ring-2 focus:ring-primary/30 transition-all text-base"
                  />
                </div>
              </div>

              {/* 错误显示 */}
              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl flex items-start gap-3 text-destructive animate-in slide-in-from-top-2">
                  <AlertCircle className="w-5 h-5 mt-0.5" />
                  <div className="flex-1 text-sm font-medium">{error}</div>
                </div>
              )}

              {/* 历史记录/库 */}
              <div className="pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="flex items-center gap-2 font-bold opacity-70">
                    <History className="w-4 h-4" />
                    {t('imageFactory.gallery')}
                  </h3>
                </div>
                <ImageGallery />
              </div>
            </div>
          </div>
        </div>

        {/* 右侧参数面板 (桌面端) */}
        {showParams && (
          <div className="hidden lg:block w-80 border-l bg-card/30 backdrop-blur-sm overflow-y-auto custom-scrollbar p-6">
            <ParameterPanel />
          </div>
        )}
      </div>

      {/* 移动端参数面板遮罩/抽屉 */}
      {showParams && (
        <div className="lg:hidden fixed inset-0 z-50 animate-in fade-in">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowParams(false)} />
          <div className="absolute right-0 inset-y-0 w-80 bg-card shadow-2xl animate-in slide-in-from-right" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-bold flex items-center gap-2">
                <Settings2 className="w-4 h-4" />
                {t('imageFactory.parameters')}
              </h2>
              <button onClick={() => setShowParams(false)} className="p-2 hover:bg-accent rounded-full">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6">
              <ParameterPanel />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageFactory;
