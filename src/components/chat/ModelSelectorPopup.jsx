/**
 * 模型选择弹出层组件
 * 使用虚拟滚动（VirtualList）高性能渲染大型模型列表，支持搜索、提供商分组折叠及模型功能标识展示。
 */

import React from 'react';
import { Search, X, Cpu, ChevronDown, Check, Brain, Camera, Image as ImageIcon, Sparkles } from 'lucide-react';
import VirtualList from '../ui/VirtualList';
import { cn } from '../../utils/cn';

/**
 * 模型选择弹窗组件
 * @param {object} props - 组件属性
 */
const ModelSelectorPopup = ({
  onClose,
  modelSearchQuery,
  setModelSearchQuery,
  modelSearchInputRef,
  flatModelItems,
  toggleProvider,
  getProviderColors,
  currentModel,
  setCurrentModel,
  t
}) => {
  return (
    <>
      <div className="fixed inset-0 z-[10000]" onClick={onClose} />
      <div className="absolute bottom-full right-0 mb-4 w-80 max-h-[70vh] bg-card border rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 z-[10001]" onClick={e => e.stopPropagation()}>
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
              onChange={e => setModelSearchQuery(e.target.value)} 
              className="w-full pl-8 pr-3 py-1.5 text-sm bg-accent/50 rounded-lg border-none focus:ring-1 focus:ring-primary outline-none" 
            />
            {modelSearchQuery && (
              <button onClick={() => setModelSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-muted rounded-full">
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        <div className="w-full">
          {flatModelItems.length === 0 ? (
            <div className="p-8 text-xs text-center text-muted-foreground flex flex-col items-center gap-3">
              <Cpu className="w-6 h-6 opacity-20" />
              <span>{modelSearchQuery ? t('sidebar.noMatches') : t('inputArea.noModels')}</span>
            </div>
          ) : (
            <VirtualList 
              items={flatModelItems} 
              itemHeight={44} 
              containerHeight={Math.min(Math.max(flatModelItems.length * 44, 150), 400)} 
              overscan={3} 
              className="p-2 custom-scrollbar" 
              renderItem={item => {
                if (item.type === 'provider') {
                  return (
                    <button onClick={() => toggleProvider(item.providerId)} className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-accent/50 transition-all group h-full">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs", item.group.hasKey ? getProviderColors(item.providerId).bg : "bg-accent", item.group.hasKey ? getProviderColors(item.providerId).text : "text-muted-foreground")}>
                          {item.group.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col items-start">
                          <span className="text-sm font-bold">{item.group.name}</span>
                          {!item.group.hasKey && <span className="text-[10px] text-destructive font-medium">{t('inputArea.noKey')}</span>}
                        </div>
                      </div>
                      <ChevronDown className={cn("w-4 h-4 opacity-50 transition-transform duration-300", item.isExpanded && "rotate-180")} />
                    </button>
                  );
                }
                const isSelected = String(currentModel?.modelId) === String(item.model.id) && String(currentModel?.providerId) === item.providerId;
                return (
                  <div className="pl-11 pr-2 h-full">
                    <button 
                      onClick={() => { 
                        setCurrentModel({ providerId: item.providerId, modelId: item.model.id }); 
                        onClose(); 
                        setModelSearchQuery(''); 
                      }} 
                      className={cn(
                        "w-full text-left p-1.5 rounded-lg transition-all flex items-center justify-between group/item border border-transparent h-full", 
                        isSelected ? "bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20" : "hover:bg-primary/5 hover:border-primary/20"
                      )}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-xs truncate">{item.model.name || item.model.id}</span>
                        <div className="flex gap-1 flex-shrink-0 transform origin-left scale-75">
                          {item.model.capabilities?.thinking && <Brain className={cn("w-3 h-3", isSelected ? "text-white" : "text-orange-500")} />}
                          {item.model.capabilities?.multimodal && <Camera className={cn("w-3 h-3", isSelected ? "text-white" : "text-purple-500")} />}
                          {item.model.capabilities?.imageGen && <ImageIcon className={cn("w-3 h-3", isSelected ? "text-white" : "text-blue-500")} />}
                          {item.model.capabilities?.tools && <Sparkles className={cn("w-3 h-3", isSelected ? "text-white" : "text-green-500")} />}
                        </div>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                );
              }} 
            />
          )}
        </div>
      </div>
    </>
  );
};

export default ModelSelectorPopup;