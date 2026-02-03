import React from 'react';
import { Menu, Eye, EyeOff, Sparkles, ChevronDown, Image } from 'lucide-react';
import { useChatStore } from '../../store/useChatStore';
import { useConfigStore } from '../../store/useConfigStore';
import { useViewStore } from '../../store/useViewStore';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import { cn } from '../../utils/cn';
import { useTranslation } from '../../i18n';

/**
 * 顶部导航组件
 * 显示当前对话元数据（标题、模型型号）、隐身模式切换器及移动端菜单触点
 */
const TopBar = ({ onMenuClick }) => {
  const { t } = useTranslation();
  const { isIncognito, setIncognito, currentConversationId, currentModel } = useChatStore();
  const { providers } = useConfigStore();
  const currentView = useViewStore(state => state.currentView);

  const conversation = useLiveQuery(
    () => db.conversations.get(currentConversationId || -1),
    [currentConversationId]
  );
  
  /**
   * 获取模型显示标识
   * 优先采用厂商配置中的 friendly name，若无则降级展示 modelId
   */
  const getModelDisplayName = () => {
    if (!currentModel?.modelId) return null;
    
    // 遍历所有提供商，查找匹配的模型
    for (const provider of providers) {
      if (provider.models && currentModel.providerId === provider.id) {
        const model = provider.models.find(m => m.id === currentModel.modelId);
        if (model) {
          return model.name || model.id; // 优先返回自定义显示名称
        }
      }
    }
    
    return currentModel.modelId; // 找不到返回原始 ID
  };

  return (
    <header className="h-16 border-b bg-background/80 backdrop-blur-md flex items-center justify-between px-4 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-2">
        <button 
          onClick={onMenuClick}
          className="p-2 hover:bg-accent rounded-xl lg:hidden transition-all active:scale-90"
        >
          <Menu className="w-5 h-5" />
        </button>
        {currentView === 'image-factory' ? (
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-1.5 rounded-lg">
              <Image className="w-4 h-4 text-primary" />
            </div>
            <h1 className="font-bold text-sm md:text-base">{t('imageFactory.title')}</h1>
          </div>
        ) : (
          <div className="flex flex-col">
            <h1 className="font-bold text-sm md:text-base max-w-[150px] md:max-w-[300px] truncate leading-tight flex items-center gap-2 group cursor-pointer">
              {isIncognito ? t('topBar.incognitoConversation') : (conversation?.title || t('topBar.newConversation'))}
            </h1>
            {currentModel && (
              <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-primary" /> {getModelDisplayName()}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setIncognito(!isIncognito)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all active:scale-95 border",
            isIncognito 
              ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" 
              : "bg-accent/50 text-muted-foreground hover:bg-accent border-transparent"
          )}
          title={isIncognito ? t('topBar.incognitoEnabled') : t('topBar.enableIncognito')}
        >
          {isIncognito ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{isIncognito ? t('topBar.incognitoActive') : t('topBar.incognitoMode')}</span>
        </button>
      </div>
    </header>
  );
};

export default TopBar;
