/**
 * 顶部状态栏组件
 * 显示当前对话标题、模型信息、视图标题，并提供隐身模式开关及移动端菜单触发器。
 */

import React from 'react';
import { Menu, Eye, EyeOff, Sparkles, Image } from 'lucide-react';
import { useChatStore } from '../../store/useChatStore';
import { useConfigStore } from '../../store/useConfigStore';
import { useViewStore } from '../../store/useViewStore';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import { cn } from '../../utils/cn';
import { useTranslation } from '../../i18n';

/**
 * 顶部工具栏组件
 * @param {object} props - 组件属性
 * @param {Function} props.onMenuClick - 移动端菜单点击回调
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
   * 获取当前模型的显示名称
   * @returns {string|null} 模型名称
   */
  const getModelDisplayName = () => {
    if (!currentModel?.modelId) return null;
    
    for (const provider of providers) {
      if (provider.models && currentModel.providerId === provider.id) {
        const model = provider.models.find(m => m.id === currentModel.modelId);
        if (model) {
          return model.name || model.id;
        }
      }
    }
    
    return currentModel.modelId;
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