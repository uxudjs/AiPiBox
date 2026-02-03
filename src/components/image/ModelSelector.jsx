import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslation } from '../../i18n';
import { useConfigStore } from '../../store/useConfigStore';
import { useImageGenStore } from '../../store/useImageGenStore';
import { useViewStore } from '../../store/useViewStore';
import { cn } from '../../utils/cn';
import { ChevronDown, X, Cpu, Check, Brain, Camera, Sparkles, Image as ImageIcon, Search } from 'lucide-react';
import VirtualList from '../ui/VirtualList';

// AI提供商品牌颜色映射表
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

const getProviderColors = (providerId) => {
  const id = String(providerId).toLowerCase();
  return PROVIDER_BRAND_COLORS[id] || { bg: 'bg-accent', text: 'text-muted-foreground' };
};

const ModelSelector = () => {
  const { t } = useTranslation();
  const providers = useConfigStore(state => state.providers);
  const { currentModel, setCurrentModel } = useImageGenStore();
  const [showSelector, setShowSelector] = useState(false);
  const [expandedProviders, setExpandedProviders] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSelector(false);
      }
    };

    if (showSelector) {
      document.addEventListener('mousedown', handleClickOutside);
      // 自动聚焦搜索框
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSelector]);

  const getGroupedModels = () => {
    const grouped = {};
    if (!Array.isArray(providers)) return grouped;
    providers.forEach(p => {
      if (Array.isArray(p.models)) {
        const selectedImageModels = p.models.filter(m => m && m.selected === true && m.capabilities?.imageGen === true);
        if (selectedImageModels.length > 0) {
          const providerId = String(p.id || 'unknown');
          grouped[providerId] = {
            name: String(p.name || t('inputArea.unnamedProvider')),
            models: selectedImageModels,
            hasKey: !!p.apiKey,
            originalProvider: p // keep ref
          };
        }
      }
    });
    return grouped;
  };

  const groupedModels = useMemo(() => getGroupedModels(), [providers, t]);

  const currentModelData = useMemo(() => {
    for (const pid in groupedModels) {
      const model = groupedModels[pid].models.find(m => m.id === currentModel.modelId && pid === currentModel.providerId);
      if (model) return { ...model, providerName: groupedModels[pid].name };
    }
    return null;
  }, [groupedModels, currentModel]);

  useEffect(() => {
    if (!currentModelData) {
      const entries = Object.entries(groupedModels);
      if (entries.length > 0) {
        setCurrentModel(entries[0][0], entries[0][1].models[0].id);
      }
    }
  }, [groupedModels, currentModelData, setCurrentModel]);

  // 监听页面切换，自动关闭模型选择器
  const currentView = useViewStore(state => state.currentView);
  useEffect(() => {
    if (currentView !== 'image-factory') {
      // 切换到非图片工厂页面时，关闭模型选择器
      setShowSelector(false);
    }
  }, [currentView]);

  const toggleProvider = (pid) => {
    const pidStr = String(pid);
    setExpandedProviders(prev => ({ ...prev, [pidStr]: !prev[pidStr] }));
  };

  // Flatten items for VirtualList with search support
  const flatItems = useMemo(() => {
    const items = [];
    const query = searchQuery.toLowerCase().trim();
    const entries = Object.entries(groupedModels);

    entries.forEach(([pid, group]) => {
      // 如果有搜索词，只显示匹配的模型（扁平化）
      if (query) {
        const matchingModels = group.models.filter(m => {
          const matchName = (m.name || '').toLowerCase().includes(query);
          const matchId = (m.id || '').toLowerCase().includes(query);
          const matchProvider = (group.name || '').toLowerCase().includes(query);
          return matchName || matchId || matchProvider;
        });

        if (matchingModels.length > 0) {
          // 搜索时强制展开显示 Provider 头
          items.push({ 
            type: 'provider', 
            id: `provider-${pid}`, 
            key: `provider-${pid}`, 
            providerId: pid, 
            group, 
            isExpanded: true 
          });
          
          matchingModels.forEach(m => {
            items.push({ 
              type: 'model', 
              id: `model-${pid}-${m.id}`, 
              key: `model-${pid}-${m.id}`, 
              providerId: pid, 
              model: m 
            });
          });
        }
      } else {
        // 正常折叠模式
        const isExpanded = !!expandedProviders[pid];
        items.push({ 
          type: 'provider', 
          id: `provider-${pid}`, 
          key: `provider-${pid}`, 
          providerId: pid, 
          group, 
          isExpanded 
        });
        
        if (isExpanded) {
          group.models.forEach(m => {
            items.push({ 
              type: 'model', 
              id: `model-${pid}-${m.id}`, 
              key: `model-${pid}-${m.id}`, 
              providerId: pid, 
              model: m 
            });
          });
        }
      }
    });

    return items;
  }, [groupedModels, searchQuery, expandedProviders]);

  const renderItem = (item) => {
    if (item.type === 'provider') {
      return (
        <button onClick={() => toggleProvider(item.providerId)} className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-accent/50 transition-all group h-full">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs transition-colors",
              item.group.hasKey ? getProviderColors(item.providerId).bg : "bg-accent",
              item.group.hasKey ? getProviderColors(item.providerId).text : "text-muted-foreground"
            )}>
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
      const isSelected = currentModel.modelId === item.model.id && currentModel.providerId === item.providerId;
      return (
        <div className="pl-11 pr-2 h-full">
          <button 
            onClick={() => {
              setCurrentModel(item.providerId, item.model.id);
              setShowSelector(false);
              setSearchQuery('');
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
  };

  if (Object.keys(groupedModels).length === 0) {
    return (
      <div className="text-xs text-destructive font-bold px-3 py-2 bg-destructive/10 rounded-xl">
        {t('imageFactory.noImageModels')}
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setShowSelector(!showSelector)} 
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-accent/50 hover:bg-accent transition-all active:scale-95 group border border-transparent hover:border-primary/20"
      >
        <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <ImageIcon className="w-3.5 h-3.5 text-primary" />
        </div>
        <div className="flex flex-col items-start min-w-0">
          <span className="text-sm font-bold text-foreground truncate max-w-[120px]">
            {currentModelData?.name || currentModel.modelId || t('imageFactory.selectModel')}
          </span>
          {currentModelData && (
            <span className="text-[10px] text-muted-foreground leading-tight">{currentModelData.providerName}</span>
          )}
        </div>
        <ChevronDown className={cn("w-4 h-4 opacity-50 transition-transform", showSelector && "rotate-180")} />
      </button>

      {showSelector && (
        <>
          <div className="absolute top-full right-0 mt-2 w-80 bg-background border rounded-3xl shadow-2xl overflow-hidden z-[9999]">
            <div className="flex items-center justify-center p-2 border-b bg-accent/20">
              <span className="text-xs font-black text-primary uppercase tracking-widest">{t('imageFactory.selectModel')}</span>
            </div>
            
            {/* 搜索框 */}
            <div className="p-2 border-b">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={t('settings.llm.searchModel')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-sm bg-accent/50 rounded-lg border-none focus:ring-1 focus:ring-primary outline-none"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-muted rounded-full"
                  >
                    <X className="w-3 h-3 text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>

            {/* 列表区域 */}
            <div className="w-full">
              <VirtualList 
                items={flatItems} 
                itemHeight={40} 
                containerHeight={flatItems.length > 0 ? Math.min(Math.max(flatItems.length * 40, 150), 300) : 150}
                overscan={3} 
                className="p-2 custom-scrollbar" 
                renderItem={renderItem} 
                emptyMessage={
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2 p-4 text-center">
                    <div className="p-3 bg-accent rounded-full opacity-50">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <span className="text-xs">
                      {searchQuery ? t('sidebar.noMatches') : t('inputArea.noModels')}
                    </span>
                  </div>
                }
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ModelSelector;
