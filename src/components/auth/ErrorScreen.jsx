/**
 * 初始化错误显示界面
 * 当应用核心加载失败时展示，提供重试及清除缓存重置的选项。
 */

import React from 'react';
import PropTypes from 'prop-types';
import { AlertCircle, RefreshCw, Trash2 } from 'lucide-react';
import { useTranslation } from '../../i18n';

/**
 * 错误显示屏组件
 * @param {object} props - 组件属性
 * @param {string} props.error - 错误消息文本
 */
const ErrorScreen = ({ error }) => {
  const { t } = useTranslation();

  /**
   * 重新加载应用
   */
  const handleReload = () => {
    window.location.reload();
  };

  /**
   * 清除本地配置缓存并重启
   */
  const handleClearCache = () => {
    if (window.confirm(t('app.clearCacheConfirm') || '确定要清除所有缓存数据并重启吗？这将登出应用并重置本地设置。')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-background p-4 animate-in fade-in duration-500">
      <div className="max-w-md w-full space-y-6 bg-card p-8 rounded-2xl shadow-xl border border-destructive/20">
        <div className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold text-destructive">
            {t('app.initFailed') || '初始化失败'}
          </h2>
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground break-words font-mono">
              {error || t('app.unknownError') || '未知错误'}
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <button
            onClick={handleReload}
            className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <RefreshCw className="w-4 h-4" />
            {t('common.reload') || '重新加载'}
          </button>
          
          <button
            onClick={handleClearCache}
            className="w-full bg-muted text-muted-foreground py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-destructive hover:text-destructive-foreground transition-all"
          >
            <Trash2 className="w-4 h-4" />
            {t('app.clearCache') || '清除缓存并重启'}
          </button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          {t('app.supportHint') || '如果问题持续出现，请尝试清除浏览器缓存或联系支持。'}
        </p>
      </div>
    </div>
  );
};

ErrorScreen.propTypes = {
  error: PropTypes.string
};

export default ErrorScreen;