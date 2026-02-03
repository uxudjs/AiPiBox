import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check, X, Brain, Camera, MessageSquare, Sparkles, AlertCircle, Cpu, Image as ImageIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import VirtualList from '../ui/VirtualList';
import { useTranslation } from '../../i18n';

// AI提供商品牌颜色映射表（与SettingsModal保持一致）
const PROVIDER_BRAND_COLORS = {
  'openai': { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', ring: 'ring-emerald-500/20' },
  'anthropic': { bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', ring: 'ring-purple-500/20' },
  'google': { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', ring: 'ring-blue-500/20' },
  'gemini': { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', ring: 'ring-blue-500/20' },
  'ollama': { bg: 'bg-slate-500/10', text: 'text-slate-600 dark:text-slate-400', ring: 'ring-slate-500/20' },
  'deepseek': { bg: 'bg-cyan-500/10', text: 'text-cyan-600 dark:text-cyan-400', ring: 'ring-cyan-500/20' },
  'siliconflow': { bg: 'bg-indigo-500/10', text: 'text-indigo-600 dark:text-indigo-400', ring: 'ring-indigo-500/20' },
  'openrouter': { bg: 'bg-violet-500/10', text: 'text-violet-600 dark:text-violet-400', ring: 'ring-violet-500/20' },
  'mistral': { bg: 'bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400', ring: 'ring-orange-500/20' },
  'groq': { bg: 'bg-yellow-500/10', text: 'text-yellow-600 dark:text-yellow-500', ring: 'ring-yellow-500/20' },
  'perplexity': { bg: 'bg-teal-500/10', text: 'text-teal-600 dark:text-teal-400', ring: 'ring-teal-500/20' },
  'xai': { bg: 'bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400', ring: 'ring-rose-500/20' },
  'aliyun': { bg: 'bg-blue-600/10', text: 'text-blue-700 dark:text-blue-400', ring: 'ring-blue-600/20' },
  'chatglm': { bg: 'bg-green-500/10', text: 'text-green-600 dark:text-green-400', ring: 'ring-green-500/20' },
  'volcengine': { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400', ring: 'ring-red-500/20' },
  'azure': { bg: 'bg-sky-500/10', text: 'text-sky-600 dark:text-sky-400', ring: 'ring-sky-500/20' },
  'lmstudio': { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', ring: 'ring-amber-500/20' },
};

const getProviderColors = (providerId) => {
  const id = String(providerId).toLowerCase();
  return PROVIDER_BRAND_COLORS[id] || { 
    bg: 'bg-accent', 
    text: 'text-muted-foreground',
    ring: 'ring-border'
  };
};

const ModelSelector = ({ 
  label, 
  value, 
  onChange, 
  providers = [], 
  type = 'chat' // chat, naming, search, compression, ocr
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedProviders, setExpandedProviders] = useState({});
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // 自动聚焦搜索框
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Toggle provider expansion
  const toggleProvider = (pid) => {
    const pidStr = String(pid);
    setExpandedProviders(prev => ({ ...prev, [pidStr]: !prev[pidStr] }));
  };

  // 获取当前选中模型的显示名称
  const currentModelDisplay = useMemo(() => {
    let displayName = t('settings.presets.selectModel');
    let isFallback = false;
    let found = false;

    if (value) {
      for (const p of providers) {
        if (Array.isArray(p.models)) {
          const model = p.models.find(m => m.id === value && m.selected === true);
          if (model) {
            displayName = `${p.name} - ${model.name || model.id}`;
            found = true;
            break;
          }
        }
      }
    }

    // 如果未配置或找不到模型，默认显示使用当前对话模型（橙色状态）
    if (!found) {
        displayName = t('settings.presets.clearSelection');
        isFallback = true;
    }

    return { displayName, isFallback, found };
  }, [value, providers, t]);

  // 扁平化数据用于 VirtualList
  const flatItems = useMemo(() => {
    const items = [];
    const query = searchQuery.toLowerCase().trim();

    providers.forEach(p => {
      if (!Array.isArray(p.models)) return;

      // 筛选符合条件的模型
      const validModels = p.models.filter(m => {
        // 1. 必须是已选中的模型 (在Provider设置中勾选)
        if (m.selected !== true) return false;

        // 2. 根据类型筛选
        if (type === 'ocr' && m.capabilities?.multimodal !== true) return false;

        // 3. 搜索过滤
        if (query) {
          const matchName = (m.name || '').toLowerCase().includes(query);
          const matchId = (m.id || '').toLowerCase().includes(query);
          const matchProvider = (p.name || '').toLowerCase().includes(query);
          return matchName || matchId || matchProvider;
        }

        return true;
      });

      if (validModels.length > 0) {
        // 如果有搜索词，直接展示模型列表，不展示折叠的 Provider 头部
        // 或者保留 Provider 头部但默认展开？
        // 通常搜索时，扁平化展示更直观，但为了保持结构，我们可以强制展开
        
        if (query) {
           // 搜索模式：扁平化模型列表，但在每个模型前加上 Provider 信息可能更好
           // 为了简单和统一，我们还是按照 Provider 分组，但全部展开
           items.push({
             type: 'provider',
             id: `provider-${p.id}`,
             provider: p,
             isExpanded: true // 搜索时强制展开
           });
           
           validModels.forEach(m => {
             items.push({
               type: 'model',
               id: `model-${p.id}-${m.id}`,
               uniqueKey: `${p.id}-${m.id}`,
               model: m,
               provider: p
             });
           });
        } else {
           // 正常模式：折叠逻辑
           const isExpanded = !!expandedProviders[String(p.id)];
           
           items.push({
             type: 'provider',
             id: `provider-${p.id}`,
             provider: p,
             isExpanded: isExpanded
           });
           
           if (isExpanded) {
             validModels.forEach(m => {
               items.push({
                 type: 'model',
                 id: `model-${p.id}-${m.id}`,
                 uniqueKey: `${p.id}-${m.id}`,
                 model: m,
                 provider: p
               });
             });
           }
        }
      }
    });

    return items;
  }, [providers, searchQuery, type, expandedProviders]);

  const renderItem = (item) => {
    if (item.type === 'provider') {
      const colors = getProviderColors(item.provider.id);
      // 搜索时点击头部没有意义，或者可以 toggle 但搜索结果应该保持显示
      // 如果有 query，我们禁用了 toggle 效果（强制展开），或者允许 toggle？
      // 为了简单，搜索时允许 toggle，但初始状态是展开的。
      
      return (
        <button 
          onClick={() => toggleProvider(item.provider.id)} 
          className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-accent/50 transition-all group h-full"
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs transition-colors",
              item.provider.apiKey ? colors.bg : "bg-accent",
              item.provider.apiKey ? colors.text : "text-muted-foreground"
            )}>
              {String(item.provider.name || '?').charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm font-bold">{item.provider.name}</span>
              {!item.provider.apiKey && <span className="text-[10px] text-destructive font-medium">{t('settings.presets.noKey')}</span>}
            </div>
          </div>
          <ChevronDown className={cn("w-4 h-4 opacity-50 transition-transform duration-300", item.isExpanded && "rotate-180")} />
        </button>
      );
    }

    if (item.type === 'model') {
      const isSelected = value === item.model.id;
      return (
        <div className="pl-11 pr-2 h-full">
          <button
            type="button"
            onClick={() => {
              onChange(item.model.id);
              setIsOpen(false);
              setSearchQuery('');
            }}
            className={cn(
              "w-full text-left p-1.5 rounded-lg transition-all flex items-center justify-between group/item border border-transparent h-full",
              isSelected 
                ? "bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20" 
                : "hover:bg-primary/5 hover:border-primary/20"
            )}
          >
            <div className="flex flex-col gap-0.5 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs truncate">{item.model.name || item.model.id}</span>
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
    return null;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full px-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-primary text-sm flex items-center justify-between transition-colors",
          currentModelDisplay.isFallback 
            ? "bg-orange-500/10 hover:bg-orange-500/15 text-orange-600 dark:text-orange-400" 
            : "bg-accent hover:bg-accent/80"
        )}
      >
        <span className={cn("truncate", currentModelDisplay.isFallback && "italic")}>
          {currentModelDisplay.displayName}
        </span>
        <ChevronDown className={cn("w-4 h-4 opacity-50 transition-transform duration-300 flex-shrink-0 ml-2", isOpen && "rotate-180")} />
      </button>

      {/* Fallback 提示 */}
      {currentModelDisplay.isFallback && (
        <p className="text-[10px] text-orange-500/70 italic px-1 mt-1">
          {t('settings.presets.fallbackHint', { type: label })}
        </p>
      )}

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full bg-card border rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[100]">
          <div className="flex items-center justify-center p-2 border-b bg-accent/20">
            <span className="text-xs font-black text-primary uppercase tracking-widest">{t('settings.presets.selectModel')}</span>
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

          {/* 清除选择按钮 */}
          <div className="p-1 border-b bg-accent/10">
            <button
              type="button"
              onClick={() => {
                onChange(null);
                setIsOpen(false);
              }}
              className="w-full p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-all flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground"
            >
              <X className="w-3.5 h-3.5" />
              {t('settings.presets.clearSelection')}
            </button>
          </div>

          {/* 列表区域 */}
          <div className="w-full">
            <VirtualList
              items={flatItems}
              itemHeight={40} // 调整为与 InputArea 一致
              containerHeight={flatItems.length > 0 ? Math.min(Math.max(flatItems.length * 40, 150), 300) : 150}
              renderItem={renderItem}
              emptyMessage={
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2 p-4 text-center">
                  <div className="p-3 bg-accent rounded-full opacity-50">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <span className="text-xs">
                    {searchQuery ? t('sidebar.noMatches') : t('settings.presets.noModels')}
                    <br/>
                    {!searchQuery && t('settings.presets.configureModels')}
                  </span>
                </div>
              }
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelSelector;
