/**
 * 全局错误边界组件
 * 捕获组件树中的运行时错误，防止应用崩溃并提供恢复选项。
 */

import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { logger } from '../services/logger';
import { useI18nStore } from '../i18n';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  /**
   * 捕获错误并更新状态
   * @param {Error} error - 错误对象
   * @returns {object} 状态更新
   */
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  /**
   * 执行错误日志记录
   * @param {Error} error - 错误对象
   * @param {object} errorInfo - 错误详情
   */
  componentDidCatch(error, errorInfo) {
    const { errorCount } = this.state;
    
    logger.error('ErrorBoundary', 'Application error caught:', {
      error: error.toString(),
      componentStack: errorInfo.componentStack
    });

    this.setState({
      error,
      errorInfo,
      errorCount: errorCount + 1
    });

    if (errorCount > 2) {
      logger.error('ErrorBoundary', 'Too many errors detected, possible infinite loop');
    }
  }

  /**
   * 重新加载页面
   */
  handleReload = () => {
    window.location.reload();
  };

  /**
   * 重置错误状态尝试继续
   */
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  /**
   * 危险操作：清空所有应用数据并重置
   */
  handleClearData = () => {
    const { t } = useI18nStore.getState();
    if (window.confirm(t ? t('error.clearDataConfirm') : '确定要清除所有数据并重置应用吗？此操作不可恢复。')) {
      localStorage.clear();
      sessionStorage.clear();
      if (window.indexedDB && window.indexedDB.databases) {
        window.indexedDB.databases().then(databases => {
          databases.forEach(db => {
            window.indexedDB.deleteDatabase(db.name);
          });
          setTimeout(() => {
            window.location.reload();
          }, 500);
        });
      } else {
        window.location.reload();
      }
    }
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, errorCount } = this.state;
      const { t } = useI18nStore.getState();

      return (
        <div className="h-screen w-full flex items-center justify-center bg-background p-4">
          <div className="max-w-2xl w-full space-y-6 bg-card p-8 rounded-2xl shadow-xl border border-destructive/20">
            <div className="text-center space-y-3">
              <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <h1 className="text-2xl font-bold text-destructive">{t('app.appError')}</h1>
              <p className="text-sm text-muted-foreground">
                很抱歉，应用程序遇到了意外错误。您可以尝试以下操作恢复：
              </p>
            </div>

            <div className="bg-accent/50 p-4 rounded-lg border border-border">
              <h3 className="text-sm font-semibold mb-2 text-foreground">{t('app.errorDetails')}</h3>
              <div className="text-xs font-mono text-muted-foreground overflow-auto custom-scrollbar max-h-32">
                {error && error.toString()}
              </div>
              {errorInfo && (
                <details className="mt-4">
                  <summary className="text-xs cursor-pointer hover:text-primary transition-colors">
                    {t ? t('error.stackTrace') : 'Stack Trace'}
                  </summary>
                  <div className="text-xs font-mono text-muted-foreground mt-2 overflow-auto custom-scrollbar max-h-40">
                    {errorInfo.componentStack}
                  </div>
                </details>
              )}
            </div>

            {errorCount > 2 && (
              <div className="bg-destructive/10 border border-destructive/30 p-3 rounded-lg">
                <p className="text-xs text-destructive font-medium">
                  检测到频繁错误，可能需要清除数据才能恢复正常
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity font-medium"
              >
                <Home className="w-4 h-4" />
                <span>{t('app.tryContinue')}</span>
              </button>
              
              <button
                onClick={this.handleReload}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-accent text-foreground rounded-xl hover:bg-accent/80 transition-colors font-medium border"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{t('common.reload')}</span>
              </button>

              <button
                onClick={this.handleClearData}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-destructive/10 text-destructive rounded-xl hover:bg-destructive/20 transition-colors font-medium border border-destructive/30"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>{t('app.clearData')}</span>
              </button>
            </div>

            <div className="text-center pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                如果问题持续存在，请尝试清除浏览器缓存或使用无痕模式访问
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;