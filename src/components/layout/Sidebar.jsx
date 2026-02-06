/**
 * 侧边导航栏组件
 * 负责管理对话历史列表、搜索过滤、批量操作、视图切换（聊天/图像工厂）以及全局设置入口。
 * 支持响应式折叠状态管理。
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Plus, Settings, Search, X, MessageSquare, Trash2, Edit2, Check, 
  Image as ImageIcon, Info, CheckCircle2, Circle, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useChatStore } from '../../store/useChatStore';
import { useUIStore } from '../../store/useViewStore';
import { cn } from '../../utils/cn';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import SettingsModal from '../settings/SettingsModal';
import { useTranslation } from '../../i18n';

/**
 * 侧边栏组件
 * @param {object} props - 组件属性
 * @param {boolean} props.isOpen - 移动端模式下是否开启
 * @param {Function} props.onClose - 移动端关闭回调
 */
const Sidebar = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    createNewConversation, 
    currentConversationId, 
    setCurrentConversation, 
    selectedConversations, 
    toggleConversationSelection, 
    deleteConversation,
    deleteBatchConversations, 
    clearAllHistory,
    markAsRead,
    updateConversationTitle
  } = useChatStore();

  const { 
    sidebarCollapsed, 
    setSidebarCollapsed,
    setMobileSidebarOpen
  } = useUIStore();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState('llm');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  /**
   * 监听全局设置面板打开请求
   */
  useEffect(() => {
    const handleOpenSettings = (event) => {
      const { tab } = event.detail || {};
      if (tab) setSettingsTab(tab);
      setSettingsOpen(true);
    };
    window.addEventListener('open-settings', handleOpenSettings);
    return () => window.removeEventListener('open-settings', handleOpenSettings);
  }, []);
  
  /**
   * 切换路由时自动关闭弹出层
   */
  useEffect(() => {
    setSettingsOpen(false);
    setMobileSidebarOpen(false);
  }, [location.pathname, setMobileSidebarOpen]);
  
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

  /**
   * 删除选中的对话项
   */
  const handleDeleteConversation = async (id, e) => {
    e.stopPropagation();
    if (confirm(t('sidebar.deleteConversation'))) {
      await deleteConversation(id);
      if (currentConversationId === id) {
        navigate('/');
      }
    }
  };

  /**
   * 开启标题编辑模式
   */
  const handleStartEdit = (conv, e) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  /**
   * 保存修改后的对话标题
   */
  const handleSaveEdit = async (e) => {
    e.stopPropagation();
    if (editingId && editTitle.trim()) {
      await updateConversationTitle(editingId, editTitle.trim());
      setEditingId(null);
      setEditTitle('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSaveEdit(e);
    else if (e.key === 'Escape') setEditingId(null);
  };

  const isChatActive = location.pathname === '/' || location.pathname.startsWith('/c/');
  const isImageActive = location.pathname === '/image';

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
        "fixed inset-y-0 left-0 z-50 bg-card border-r flex flex-col transition-all duration-300 transform lg:static lg:translate-x-0 shadow-2xl lg:shadow-none",
        isOpen ? "translate-x-0" : "-translate-x-full",
        sidebarCollapsed ? "lg:w-20" : "w-80"
      )}>
        <div className={cn(
          "p-6 flex items-center justify-between border-b bg-accent/10 min-h-[81px]",
          sidebarCollapsed && "px-0 justify-center"
        )}>
          {!sidebarCollapsed && (
            <h2 className="text-xl font-black flex items-center gap-2 tracking-tighter">
              <div className="bg-primary p-1.5 rounded-xl shadow-lg shadow-primary/20">
                <MessageSquare className="w-5 h-5 text-primary-foreground" />
              </div>
              AiPiBox
            </h2>
          )}
          {sidebarCollapsed && (
            <div className="bg-primary p-1.5 rounded-xl shadow-lg shadow-primary/20">
              <MessageSquare className="w-5 h-5 text-primary-foreground" />
            </div>
          )}
          <button onClick={onClose} className="lg:hidden p-2 hover:bg-accent rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
          
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex p-2 hover:bg-accent rounded-xl text-muted-foreground transition-colors ml-2"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {!sidebarCollapsed && (
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
        )}

        <div className={cn(
          "flex-1 overflow-y-auto px-3 space-y-1 custom-scrollbar pb-4",
          sidebarCollapsed && "px-2 items-center"
        )}>
          {!sidebarCollapsed && (
            <div className="flex items-center justify-between px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-50">
              <span>{t('sidebar.recentConversations')}</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsMultiSelect(!isMultiSelect)} 
                  className={cn("px-2 py-0.5 rounded-md transition-all", isMultiSelect ? "bg-primary text-primary-foreground" : "hover:text-primary")}
                >
                  {isMultiSelect ? t('sidebar.cancelSelect') : t('sidebar.multiSelect')}
                </button>
                <button 
                  onClick={clearAllHistory} 
                  className={cn(
                    "hover:text-destructive transition-colors flex items-center gap-1",
                    isMultiSelect && "hidden"
                  )}
                >
                  {t('sidebar.clearAll')}
                </button>
                {isMultiSelect && selectedConversations.length > 0 && (
                  <button 
                    onClick={deleteBatchConversations}
                    className="text-destructive hover:opacity-80 transition-all flex items-center gap-1 animate-in fade-in slide-in-from-right-2"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{t('common.delete')}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {conversations.length === 0 ? (
            !sidebarCollapsed && (
              <div className="py-10 text-center text-xs text-muted-foreground opacity-50">
                {searchQuery ? t('sidebar.noMatches') : t('sidebar.noConversations')}
              </div>
            )
          ) : (
            conversations.map(conv => (
              <div key={conv.id} className="group relative">
                <button
                  onClick={() => {
                    if (isMultiSelect) {
                      toggleConversationSelection(conv.id);
                    } else {
                      setCurrentConversation(conv.id);
                      markAsRead(conv.id);
                      navigate(`/c/${conv.id}`);
                      onClose();
                    }
                  }}
                  className={cn(
                    "w-full text-left rounded-2xl text-sm transition-all flex items-center gap-3",
                    sidebarCollapsed ? "p-3 justify-center" : "px-4 py-3",
                    currentConversationId === conv.id 
                      ? "bg-primary/10 text-primary font-bold shadow-sm" 
                      : "hover:bg-accent text-muted-foreground hover:text-foreground",
                    selectedConversations.includes(conv.id) && "ring-2 ring-primary bg-primary/5"
                  )}
                  title={sidebarCollapsed ? conv.title : undefined}
                >
                  {isMultiSelect && !sidebarCollapsed ? (
                    selectedConversations.includes(conv.id) 
                      ? <CheckCircle2 className="w-4 h-4 text-primary" />
                      : <Circle className="w-4 h-4 opacity-20" />
                  ) : (
                    <MessageSquare className={cn("w-4 h-4 flex-shrink-0", currentConversationId === conv.id ? "text-primary" : "opacity-40")} />
                  )}
                  
                  {!sidebarCollapsed && (
                    editingId === conv.id ? (
                      <div className="flex-1 flex items-center gap-1 min-w-0" onClick={e => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={handleKeyDown}
                          autoFocus
                          className="flex-1 bg-background border border-primary/20 rounded px-2 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <button onClick={handleSaveEdit} className="p-1 hover:bg-primary/10 text-primary rounded"><Check className="w-3 h-3" /></button>
                      </div>
                    ) : (
                      <span className="truncate flex-1">{conv.title}</span>
                    )
                  )}
                  
                  {!isMultiSelect && currentConversationId !== conv.id && (
                    <>
                      {conv.isGenerating && (
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-lg shadow-blue-500/50" />
                      )}
                      {!conv.isGenerating && conv.hasUnread && (
                        <div className="w-2 h-2 rounded-full bg-orange-500 shadow-lg shadow-orange-500/50" />
                      )}
                    </>
                  )}
                </button>
                
                {!isMultiSelect && !editingId && !sidebarCollapsed && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={(e) => handleStartEdit(conv, e)} className="p-1.5 text-muted-foreground hover:text-primary rounded-lg hover:bg-primary/10 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={(e) => handleDeleteConversation(conv.id, e)} className="p-1.5 text-muted-foreground hover:text-destructive rounded-lg hover:bg-destructive/10 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className={cn("p-4 border-t bg-accent/5 space-y-3", sidebarCollapsed && "px-2 py-4")}>
          <div className={cn("flex gap-2", sidebarCollapsed && "flex-col")}>
            <button 
              onClick={() => { navigate('/image'); onClose(); }}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-2xl transition-all active:scale-[0.95] font-bold shadow-sm",
                sidebarCollapsed ? "p-3" : "py-3",
                isImageActive
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "bg-accent/50 text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
              title={t('imageFactory.title')}
            >
              <ImageIcon className="w-5 h-5" />
              {!sidebarCollapsed && <span className="text-[10px]">{t('imageFactory.title')}</span>}
            </button>

            <button 
              onClick={() => { createNewConversation(); navigate('/'); onClose(); }}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-2xl transition-all active:scale-[0.95] font-bold shadow-sm",
                sidebarCollapsed ? "p-3" : "py-3",
                isChatActive && !currentConversationId
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "bg-accent/50 text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
              title={t('sidebar.newConversation')}
            >
              <Plus className="w-5 h-5" />
              {!sidebarCollapsed && <span className="text-[10px]">{t('sidebar.newConversation')}</span>}
            </button>
          </div>
          
          <button 
            onClick={() => setSettingsOpen(true)}
            className={cn(
              "w-full flex items-center gap-2 hover:bg-primary/10 hover:text-primary rounded-2xl text-sm font-bold transition-all text-muted-foreground",
              sidebarCollapsed ? "p-3 justify-center" : "px-4 py-3 justify-center"
            )}
            title={t('common.settings')}
          >
            <Settings className="w-4 h-4" />
            {!sidebarCollapsed && <span>{t('common.settings')}</span>}
          </button>
          
          {!sidebarCollapsed && (
            <div className="flex items-center justify-between px-2 pt-2">
              <span className="text-[10px] font-bold text-muted-foreground opacity-30 flex items-center gap-1 uppercase tracking-tighter">
                <Info className="w-2.5 h-2.5" /> AiPiBox v1.1.0
              </span>
            </div>
          )}
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