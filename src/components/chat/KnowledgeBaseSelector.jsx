import React, { useState } from 'react';
import { X, Check, BookOpen, FileText, ChevronRight, Search, Settings } from 'lucide-react';
import { useKnowledgeBaseStore } from '../../store/useKnowledgeBaseStore';
import { cn } from '../../utils/cn';
import { useTranslation } from '../../i18n';

/**
 * 知识库选择器组件
 * 在对话界面显示，用户可以选择要使用的知识库
 */
const KnowledgeBaseSelector = ({ onClose, onSelectKnowledgeBase, inline = false }) => {
  const { t } = useTranslation();
  const {
    knowledgeBases,
    activeKnowledgeBase,
    setActiveKnowledgeBase,
    getKnowledgeBaseStats
  } = useKnowledgeBaseStore();
  
  const [selectedKB, setSelectedKB] = useState(activeKnowledgeBase);
  const [searchQuery, setSearchQuery] = useState('');

  // 处理知识库选择
  const handleSelect = (kbId) => {
    const targetKBId = kbId === activeKnowledgeBase ? null : kbId;
    setActiveKnowledgeBase(targetKBId);
    if (onSelectKnowledgeBase) {
      const kb = knowledgeBases.find(k => k.id === targetKBId);
      onSelectKnowledgeBase(kb || null);
    }
    onClose();
  };

  // 取消选择（清空激活的知识库）
  const handleClear = () => {
    setActiveKnowledgeBase(null);
    setSelectedKB(null);
    if (onSelectKnowledgeBase) {
      onSelectKnowledgeBase(null);
    }
    onClose();
  };

  // 跳转到设置
  const handleOpenSettings = () => {
    onClose();
    window.dispatchEvent(new CustomEvent('open-settings', { detail: { tab: 'knowledge-base' } }));
  };

  // 过滤知识库
  const filteredKBs = knowledgeBases.filter(kb => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return kb.name.toLowerCase().includes(query) ||
           (kb.description && kb.description.toLowerCase().includes(query));
  });

  return inline ? (
    // Inline模式：用于InputArea中的弹窗
    <div className="bg-card rounded-3xl shadow-2xl max-w-full w-full max-h-[70vh] flex flex-col border overflow-hidden" onClick={(e) => e.stopPropagation()}>
      {/* 头部 */}
      <div className="flex items-center justify-between p-2 border-b bg-accent/20">
        <div className="w-8" /> {/* 占位以居中标题 */}
        <span className="text-xs font-black text-primary uppercase tracking-widest">{t('inputArea.selectKB')}</span>
        <button
          onClick={onClose}
          className="p-1 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 搜索框 */}
      <div className="p-2 border-b">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('knowledgeBase.searchKB')}
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
          onClick={handleClear}
          className="w-full p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-all flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground"
        >
          <X className="w-3.5 h-3.5" />
          {t('knowledgeBase.clearSelection')}
        </button>
      </div>

      {/* 知识库列表 */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
        {knowledgeBases.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
            <div className="p-4 bg-accent rounded-2xl">
              <BookOpen className="w-6 h-6 text-muted-foreground opacity-30" />
            </div>
            <div className="space-y-1 px-4">
              <p className="text-xs text-muted-foreground">{t('knowledgeBase.noKB')}</p>
              <p className="text-[10px] text-muted-foreground opacity-70">
                {t('knowledgeBase.kbHint')}
              </p>
            </div>
            <button
              onClick={handleOpenSettings}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-colors text-xs font-bold"
            >
              <BookOpen className="w-3.5 h-3.5" />
              {t('knowledgeBase.goToCreate')}
            </button>
          </div>
        ) : filteredKBs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-xs text-muted-foreground">{t('knowledgeBase.noMatches')}</p>
          </div>
        ) : (
          filteredKBs.map((kb) => {
            const stats = getKnowledgeBaseStats(kb.id);
            const isSelected = activeKnowledgeBase === kb.id;
            
            return (
              <button
                key={kb.id}
                onClick={() => handleSelect(kb.id)}
                className={cn(
                  "w-full p-2 rounded-lg transition-all text-left flex items-center justify-between group border border-transparent",
                  isSelected
                    ? "bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20"
                    : "hover:bg-primary/5 hover:border-primary/20"
                )}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                    isSelected ? "bg-white/20" : "bg-accent"
                  )}>
                    <FileText className={cn(
                      "w-4 h-4",
                      isSelected ? "text-white" : "text-muted-foreground"
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs truncate">{kb.name}</h4>
                    {stats && (
                      <p className={cn(
                        "text-[10px] opacity-70",
                        isSelected ? "text-white" : "text-muted-foreground"
                      )}>
                        {stats.totalDocuments} {t('knowledgeBase.documents')}
                      </p>
                    )}
                  </div>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5" />}
              </button>
            );
          })
        )}
      </div>

      {/* 管理按钮 */}
      <div className="p-1 border-t bg-accent/5">
        <button
          onClick={handleOpenSettings}
          className="w-full py-2 hover:bg-accent rounded-lg transition-colors text-[10px] font-bold text-muted-foreground flex items-center justify-center gap-1.5 uppercase tracking-wider"
        >
          <Settings className="w-3 h-3" />
          {t('knowledgeBase.manageKB')}
        </button>
      </div>
    </div>
  ) : (
    // 全屏模式：用于独立弹窗
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col border animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        {/* 头部 */}
        <div className="flex items-center justify-end p-2 border-b">
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-accent rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 搜索框 */}
        {knowledgeBases.length > 3 && (
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('knowledgeBase.searchKB')}
                className="w-full pl-10 pr-4 py-2 bg-accent rounded-xl border-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
          </div>
        )}

        {/* 知识库列表 */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
          {knowledgeBases.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 bg-accent rounded-2xl mb-4">
                <BookOpen className="w-8 h-8 text-muted-foreground opacity-30" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">{t('knowledgeBase.noKB')}</p>
              <p className="text-xs text-muted-foreground mb-4">
                {t('knowledgeBase.kbHint')}
              </p>
              <button
                onClick={handleOpenSettings}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-colors text-sm"
              >
                <BookOpen className="w-4 h-4" />
                {t('knowledgeBase.goToCreate')}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
        ) : filteredKBs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-muted-foreground">{t('knowledgeBase.noMatches')}</p>
          </div>
          ) : (
            filteredKBs.map((kb) => {
              const stats = getKnowledgeBaseStats(kb.id);
              const isSelected = selectedKB === kb.id;
              
              return (
                <button
                  key={kb.id}
                  onClick={() => setSelectedKB(kb.id)}
                  className={cn(
                    "w-full p-4 rounded-xl border transition-all text-left",
                    isSelected
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border hover:border-primary/50 hover:bg-accent/50"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={cn(
                        "p-2 rounded-lg flex-shrink-0",
                        isSelected ? "bg-primary/20" : "bg-accent"
                      )}>
                        <FileText className={cn(
                          "w-5 h-5",
                          isSelected ? "text-primary" : "text-muted-foreground"
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm truncate">{kb.name}</h4>
                          {isSelected && (
                            <div className="flex-shrink-0 p-1 bg-primary rounded-full">
                              <Check className="w-3 h-3 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                        {kb.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {kb.description}
                          </p>
                        )}
                        {stats && (
                          <div className="flex gap-3 mt-2 text-[10px] text-muted-foreground">
                            <span>{t('knowledgeBase.documentsCount', { count: stats.totalDocuments })}</span>
                            <span>{t('knowledgeBase.chunksCount', { count: stats.totalChunks })}</span>
                            <span>{stats.formattedSize}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* 底部操作按钮 */}
        <div className="flex gap-3 p-4 border-t bg-accent/5">
          {activeKnowledgeBase && (
            <button
              onClick={handleClear}
              className="flex-1 py-2.5 bg-accent rounded-xl hover:bg-accent/80 transition-colors text-sm font-medium"
            >
              {t('knowledgeBase.clearSelection')}
            </button>
          )}
          <button
            onClick={handleOpenSettings}
            className="flex-1 py-2.5 bg-accent rounded-xl hover:bg-accent/80 transition-colors text-sm font-medium flex items-center justify-center gap-2"
          >
            {t('knowledgeBase.manageKB')}
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={handleSelect}
            disabled={!selectedKB}
            className={cn(
              "flex-1 py-2.5 rounded-xl transition-colors text-sm font-medium",
              selectedKB
                ? "bg-primary text-primary-foreground hover:opacity-90"
                : "bg-accent text-muted-foreground cursor-not-allowed"
            )}
          >
            {t('knowledgeBase.confirmSelection')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBaseSelector;
