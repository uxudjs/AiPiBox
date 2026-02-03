import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import { logger } from '../../services/logger';
import VirtualList from '../ui/VirtualList';
import { Download, Trash2, Filter, AlertCircle, Info, Bug, AlertTriangle, CheckCircle, X, Copy } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../utils/cn';
import { useTranslation } from '../../i18n';

// Helper functions defined outside components
const getLevelColor = (level) => {
  switch (level.toLowerCase()) {
    case 'error': return 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/50';
    case 'warn': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-900/50';
    case 'info': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900/50';
    case 'debug': return 'text-gray-500 bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
    default: return 'text-gray-500';
  }
};

const getLevelIcon = (level) => {
  switch (level.toLowerCase()) {
    case 'error': return <AlertCircle className="w-3 h-3" />;
    case 'warn': return <AlertTriangle className="w-3 h-3" />;
    case 'info': return <Info className="w-3 h-3" />;
    case 'debug': return <Bug className="w-3 h-3" />;
    default: return <Info className="w-3 h-3" />;
  }
};

// 日志详情弹窗组件
const LogDetailsModal = ({ log, onClose }) => {
  const { t } = useTranslation();
  if (!log) return null;
  
  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(log, null, 2));
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="bg-background w-full max-w-3xl max-h-[95%] rounded-xl shadow-2xl border border-border flex flex-col overflow-hidden animate-in zoom-in-95 duration-200" 
        onClick={e => e.stopPropagation()}
      >
        <div className="px-4 py-3 border-b border-border flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm">{t('settings.logs.logDetails')}</h3>
            <span className="text-xs text-muted-foreground font-mono">
              {format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss.SSS')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleCopy}
              className="p-1.5 hover:bg-accent rounded-md transition-colors text-muted-foreground hover:text-foreground"
              title={t('settings.logs.copyLogs')}
            >
              <Copy className="w-4 h-4" />
            </button>
            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-accent rounded-md transition-colors text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="space-y-4">
            {/* 单行显示级别和模块 */}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2 p-2.5 bg-muted/30 rounded-lg border border-border/50 flex-1">
                <span className="text-muted-foreground flex-shrink-0">{t('settings.logs.level')}:</span>
                <span className={cn(
                  "font-bold uppercase px-1.5 py-0.5 rounded-[3px] text-[10px] border flex items-center gap-1",
                  getLevelColor(log.level)
                )}>
                  {getLevelIcon(log.level)}
                  {log.level}
                </span>
              </div>
              <div className="flex items-center gap-2 p-2.5 bg-muted/30 rounded-lg border border-border/50 flex-1 min-w-0">
                <span className="text-muted-foreground flex-shrink-0">{t('settings.logs.module')}:</span>
                <span className="font-mono font-semibold truncate" title={log.module}>{log.module}</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-medium px-1">{t('settings.logs.content')}</span>
              <div className="p-4 bg-muted/20 rounded-lg border border-border/50 font-mono text-xs whitespace-pre-wrap break-all leading-relaxed select-text">
                {log.content}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SystemLogs = ({ searchQuery = '' }) => {
  const { t } = useTranslation();
  const [filterLevel, setFilterLevel] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState(null);
  const containerRef = useRef(null);
  const [listHeight, setListHeight] = useState(500); // 默认高度，会被 ResizeObserver 更新
  
  // Use Dexie's live query to watch logs
  const logs = useLiveQuery(
    () => db.system_logs.orderBy('timestamp').reverse().toArray(),
    []
  );

  const filteredLogs = useMemo(() => {
    if (!logs) return [];
    
    return logs.filter(log => {
      // Level filter
      if (filterLevel !== 'ALL' && log.level.toUpperCase() !== filterLevel) {
        return false;
      }
      
      // Search query (passed from parent)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          log.content.toLowerCase().includes(query) ||
          log.module.toLowerCase().includes(query) ||
          log.level.toLowerCase().includes(query)
        );
      }
      
      return true;
    });
  }, [logs, filterLevel, searchQuery]);

  // 监听容器大小变化，动态调整列表高度
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        setListHeight(entry.contentRect.height);
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleClearLogs = async () => {
    if (confirm(t('settings.logs.clearConfirm'))) {
      await logger.clear();
    }
  };

  const handleExportLogs = () => {
    logger.export();
  };

  // 优化后的列表项渲染：固定高度，内容截断
  const renderLogItem = (log) => (
    <div 
      onClick={() => setSelectedLog(log)}
      className="h-[60px] flex flex-col justify-center px-6 border-b border-border/40 hover:bg-accent/40 cursor-pointer transition-all group"
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[10px] text-muted-foreground font-mono w-[140px] flex-shrink-0">
          {format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss.SSS')}
        </span>
        <span className={cn(
          "px-1.5 py-0.5 rounded-[4px] border text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-[70px] justify-center",
          getLevelColor(log.level)
        )}>
          {log.level}
        </span>
        <span className="text-xs font-semibold text-foreground/70 truncate max-w-[120px]">
          {log.module}
        </span>
      </div>
      <div className="font-mono text-xs text-foreground/80 truncate pl-[148px] group-hover:text-foreground transition-colors">
        {log.content}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full relative">
      {/* Log Details Modal Overlay */}
      {selectedLog && <LogDetailsModal log={selectedLog} onClose={() => setSelectedLog(null)} />}

      {/* Toolbar - Filters Left, Actions Right */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 border-b border-border shrink-0">
        {/* Left: Filters */}
        <div className="flex items-center gap-1">
           {['ALL', 'ERROR', 'WARN', 'INFO', 'DEBUG'].map((level) => (
             <button
               key={level}
               onClick={() => setFilterLevel(level)}
               className={cn(
                 "px-3 py-1.5 text-[11px] font-medium rounded-md transition-all border border-transparent",
                 filterLevel === level 
                   ? "bg-background text-primary shadow-sm border-border" 
                   : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
               )}
             >
               {level === 'ALL' ? t('common.all') || 'ALL' : level}
             </button>
           ))}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleClearLogs}
            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
            title={t('settings.logs.clearLogs')}
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleExportLogs}
            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
            title={t('settings.logs.exportLogs')}
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Log List */}
      <div ref={containerRef} className="flex-1 overflow-hidden relative">
        <VirtualList
          items={filteredLogs}
          renderItem={renderLogItem}
          itemHeight={60} // Fixed height matching the renderItem container
          containerHeight={listHeight} // Dynamically observed height
          className="h-full custom-scrollbar"
          emptyMessage={
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <p className="text-sm font-medium">{t('settings.logs.noLogs')}</p>
            </div>
          }
        />
      </div>
      
      {/* Footer / Status */}
      <div className="px-6 py-2 border-t border-border text-[11px] text-muted-foreground flex justify-between items-center shrink-0">
        <span className="font-mono">{t('settings.logs.totalRecords', { count: filteredLogs.length })}</span>
        {logs && logs.length > filteredLogs.length && (
           <span className="opacity-70">{t('settings.logs.filteredRecords', { count: logs.length - filteredLogs.length })}</span>
        )}
      </div>
    </div>
  );
};

export default SystemLogs;
