import React, { useState, useEffect } from 'react';
import { Plus, Settings, Search, X, MessageSquare, History, Trash2, MoreHorizontal, Info, CheckCircle2, Circle, Loader2, Image, Edit2, Check } from 'lucide-react';
import { useChatStore } from '../../store/useChatStore';
import { useViewStore } from '../../store/useViewStore';
import { cn } from '../../utils/cn';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import SettingsModal from '../settings/SettingsModal';
import { useTranslation } from '../../i18n';

/**
 * 侧边导航栏组件
 * 管理对话列表展示、历史搜索、批量操作、视图切换及全局设置入口
 */
const Sidebar = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { 
    createNewConversation, 
    currentConversationId, 
    setCurrentConversation, 
    selectedConversations, 
    toggleConversationSelection, 
    deleteBatchConversations, 
    clearSelection,
    clearAllHistory,
    markAsRead,
    updateConversationTitle
  } = useChatStore();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState('llm');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  
  // Title editing state
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  // 监听来自其他组件的设置打开事件
  useEffect(() => {
    const handleOpenSettings = (event) => {
      const { tab } = event.detail || {};
      if (tab) {
        setSettingsTab(tab);
      }
      setSettingsOpen(true);
    };
    
    window.addEventListener('open-settings', handleOpenSettings);
    return () => window.removeEventListener('open-settings', handleOpenSettings);
  }, []);
  
  // 监听页面切换，自动关闭设置弹窗
  const currentView = useViewStore(state => state.currentView);
  useEffect(() => {
    // 当切换页面时，关闭设置弹窗
    setSettingsOpen(false);
  }, [currentView]);
  
  const conversations = useLiveQuery(
    () => {
      let query = db.conversations.orderBy('lastUpdatedAt').reverse();
      if (searchQuery) {
        return query.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase())).toArray();
      }
      return query.toArray();
    },
    [searchQuery]
  ) || [];

  const handleDeleteConversation = async (id, e) => {
    e.stopPropagation();
    if (confirm(t('sidebar.deleteConversation'))) {
      await db.conversations.delete(id);
      await db.messages.where('conversationId').equals(id).delete();
      if (currentConversationId === id) setCurrentConversation(null);
    }
  };

  const handleStartEdit = (conv, e) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const handleSaveEdit = async (e) => {
    e.stopPropagation();
    if (editingId && editTitle.trim()) {
      await updateConversationTitle(editingId, editTitle.trim());
      setEditingId(null);
      setEditTitle('');
    }
  };

  const handleCancelEdit = (e) => {
    e.stopPropagation();
    setEditingId(null);
    setEditTitle('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveEdit(e);
    } else if (e.key === 'Escape') {
      handleCancelEdit(e);
    }
  };

  return (
    <>
      <div 
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-80 bg-card border-r flex flex-col transition-all duration-300 transform lg:static lg:translate-x-0 shadow-2xl lg:shadow-none",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between border-b bg-accent/10">
          <h2 className="text-xl font-black flex items-center gap-2 tracking-tighter">
            <div className="bg-primary p-1.5 rounded-xl shadow-lg shadow-primary/20">
              <MessageSquare className="w-5 h-5 text-primary-foreground" />
            </div>
            AiPiBox
          </h2>
          <button onClick={onClose} className="lg:hidden p-2 hover:bg-accent rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 py-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder={t('sidebar.searchPlaceholder')} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-accent/50 rounded-2xl text-sm border-none focus:ring-2 focus:ring-primary/50 transition-all shadow-inner"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 space-y-1 custom-scrollbar pb-4">
          <div className="flex items-center justify-between px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-50">
            <span>{t('sidebar.recentConversations')}</span>
            <div className="flex gap-2">
              <button 
                onClick={() => setIsMultiSelect(!isMultiSelect)} 
                className={cn(
                  "px-2 py-0.5 rounded-md transition-all",
                  isMultiSelect ? "bg-primary text-primary-foreground" : "hover:text-primary"
                )}
              >
                {isMultiSelect ? t('sidebar.cancelSelect') : t('sidebar.multiSelect')}
              </button>
              <button onClick={clearAllHistory} className="hover:text-destructive transition-colors">
                {t('sidebar.clearAll')}
              </button>
            </div>
          </div>

          {isMultiSelect && selectedConversations.length > 0 && (
            <div className="px-3 pb-2 animate-in slide-in-from-top-1">
              <button 
                onClick={() => {
                   if (confirm(t('sidebar.deleteConfirm', { count: selectedConversations.length }))) {
                     deleteBatchConversations();
                     setIsMultiSelect(false);
                   }
                }}
                className="w-full py-2 bg-destructive/10 text-destructive text-xs font-bold rounded-xl hover:bg-destructive/20 transition-all flex items-center justify-center gap-2"
              >
                <Trash2 className="w-3 h-3" />
                {t('sidebar.deleteSelected')} ({selectedConversations.length})
              </button>
            </div>
          )}

          {conversations.length === 0 ? (
            <div className="py-10 text-center text-xs text-muted-foreground opacity-50">
              {searchQuery ? t('sidebar.noMatches') : t('sidebar.noConversations')}
            </div>
          ) : (
            conversations.map(conv => (
              <div 
                key={conv.id}
                className="group relative"
              >
                <button
                  onClick={() => {
                    if (isMultiSelect) {
                      toggleConversationSelection(conv.id);
                    } else {
                      // 切换到对话视图
                      useViewStore.getState().setView('chat');
                      setCurrentConversation(conv.id);
                      // 点击对话时标记为已读
                      markAsRead(conv.id);
                      onClose();
                    }
                  }}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-2xl text-sm transition-all flex items-center gap-3",
                    currentConversationId === conv.id 
                      ? "bg-primary/10 text-primary font-bold shadow-sm" 
                      : "hover:bg-accent text-muted-foreground hover:text-foreground",
                    selectedConversations.includes(conv.id) && "ring-2 ring-primary bg-primary/5",
                    editingId === conv.id && "bg-accent"
                  )}
                >
                  {isMultiSelect ? (
                    selectedConversations.includes(conv.id) 
                      ? <CheckCircle2 className="w-4 h-4 text-primary" />
                      : <Circle className="w-4 h-4 opacity-20" />
                  ) : (
                    <MessageSquare className={cn("w-4 h-4 flex-shrink-0", currentConversationId === conv.id ? "text-primary" : "opacity-40")} />
                  )}
                  
                  {editingId === conv.id ? (
                    <div className="flex-1 flex items-center gap-1 min-w-0" onClick={e => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        className="flex-1 bg-background border border-primary/20 rounded px-2 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                        onClick={e => e.stopPropagation()}
                      />
                      <button 
                        onClick={handleSaveEdit}
                        className="p-1 hover:bg-primary/10 text-primary rounded"
                        title={t('sidebar.saveTitle')}
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={handleCancelEdit}
                        className="p-1 hover:bg-destructive/10 text-destructive rounded"
                        title={t('sidebar.cancelEdit')}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <span className="truncate flex-1">{conv.title}</span>
                  )}
                  
                  {/* 状态指示点 */}
                  {!isMultiSelect && currentConversationId !== conv.id && !editingId && (
                    <>
                      {/* 蓝色闪烁圆点：正在生成 */}
                      {conv.isGenerating && (
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-lg shadow-blue-500/50" title={t('sidebar.generating')} />
                      )}
                      
                      {/* 橙色常亮圆点：生成完成且未读 */}
                      {!conv.isGenerating && conv.hasUnread && (
                        <div className="w-2 h-2 rounded-full bg-orange-500 shadow-lg shadow-orange-500/50" title={t('sidebar.unread')} />
                      )}
                    </>
                  )}
                </button>
                
                {!isMultiSelect && !editingId && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={(e) => handleStartEdit(conv, e)}
                      className="p-1.5 text-muted-foreground hover:text-primary rounded-lg hover:bg-primary/10 transition-colors"
                      title={t('sidebar.editTitle')}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={(e) => handleDeleteConversation(conv.id, e)}
                      className="p-1.5 text-muted-foreground hover:text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
                      title={t('common.delete')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t bg-accent/5 space-y-3">
          {/* 顶部操作按钮区 */}
          <div className="flex gap-2">
            {/* 图片工厂按钮 */}
            <button 
              onClick={() => { 
                useViewStore.getState().setView('image-factory');
                onClose(); 
              }}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-2xl transition-all active:scale-[0.95] font-bold shadow-sm",
                useViewStore.getState().currentView === 'image-factory'
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "bg-accent/50 text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Image className="w-5 h-5" />
              <span className="text-[10px]">{t('imageFactory.title')}</span>
            </button>

            {/* 开启新对话按钮 */}
            <button 
              onClick={() => { 
                useViewStore.getState().setView('chat');
                createNewConversation(); 
                onClose(); 
              }}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-2xl transition-all active:scale-[0.95] font-bold shadow-sm",
                useViewStore.getState().currentView === 'chat'
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "bg-accent/50 text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Plus className="w-5 h-5" />
              <span className="text-[10px]">{t('sidebar.newConversation')}</span>
            </button>
          </div>
          
          {/* 设置按钮 */}
          <button 
            onClick={() => { setSettingsOpen(true); }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 hover:bg-primary/10 hover:text-primary rounded-2xl text-sm font-bold transition-all text-muted-foreground"
          >
            <Settings className="w-4 h-4" />
            <span>{t('common.settings')}</span>
          </button>
          
          {/* 版本信息 */}
          <div className="flex items-center justify-between px-2 pt-2">
            <span className="text-[10px] font-bold text-muted-foreground opacity-30 flex items-center gap-1 uppercase tracking-tighter">
              <Info className="w-2.5 h-2.5" /> AiPiBox v1.1.0
            </span>
          </div>
        </div>
      </aside>

      <SettingsModal 
        isOpen={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
        initialTab={settingsTab}
      />
    </>
  );
};

export default Sidebar;
