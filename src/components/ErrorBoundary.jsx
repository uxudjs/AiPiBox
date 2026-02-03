import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { logger } from '../services/logger';
import { useI18nStore } from '../i18n';

/**
 * 全局错误边界组件
 * 捕获React组件树中的错误，防止整个应用崩溃
 */
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

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    const { errorCount } = this.state;
    
    // 记录错误
    logger.error('ErrorBoundary', 'Application error caught:', {
      error: error.toString(),
      componentStack: errorInfo.componentStack
    });

    this.setState({
      error,
      errorInfo,
      errorCount: errorCount + 1
    });

    // 如果错误频繁发生（5秒内超过3次），可能是循环错误
    if (errorCount > 2) {
      logger.error('ErrorBoundary', 'Too many errors detected, possible infinite loop');
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleClearData = () => {
    const { t } = useI18nStore.getState();
    if (window.confirm(t('error.clearDataConfirm'))) {
      // 清除所有localStorage数据
      localStorage.clear();
      // 清除所有sessionStorage数据
      sessionStorage.clear();
      // 清除IndexedDB（需要重新加载页面才能完全清除）
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

      return (
        <div className="h-screen w-full flex items-center justify-center bg-background p-4">
          <div className="max-w-2xl w-full space-y-6 bg-card p-8 rounded-2xl shadow-xl border border-destructive/20">
            <div className="text-center space-y-3">
              <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <h1 className="text-2xl font-bold text-destructive">应用程序遇到错误</h1>
              <p className="text-sm text-muted-foreground">
                很抱歉，应用程序遇到了意外错误。您可以尝试以下操作恢复：
              </p>
            </div>

            {/* 错误详情 */}
            <div className="bg-accent/50 p-4 rounded-lg border border-border">
              <h3 className="text-sm font-semibold mb-2 text-foreground">错误详情：</h3>
              <div className="text-xs font-mono text-muted-foreground overflow-auto custom-scrollbar max-h-32">
                {error && error.toString()}
              </div>
              {errorInfo && (
                <details className="mt-4">
                  <summary className="text-xs cursor-pointer hover:text-primary transition-colors">
                    {t('error.stackTrace')}
                  </summary>
                  <div className="text-xs font-mono text-muted-foreground mt-2 overflow-auto custom-scrollbar max-h-40">
                    {errorInfo.componentStack}
                  </div>
                </details>
              )}
            </div>

            {/* 错误频率警告 */}
            {errorCount > 2 && (
              <div className="bg-destructive/10 border border-destructive/30 p-3 rounded-lg">
                <p className="text-xs text-destructive font-medium">
                  ⚠️ 检测到频繁错误，可能需要清除数据才能恢复正常
                </p>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity font-medium"
              >
                <Home className="w-4 h-4" />
                <span>尝试继续</span>
              </button>
              
              <button
                onClick={this.handleReload}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-accent text-foreground rounded-xl hover:bg-accent/80 transition-colors font-medium border"
              >
                <RefreshCw className="w-4 h-4" />
                <span>重新加载</span>
              </button>

              <button
                onClick={this.handleClearData}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-destructive/10 text-destructive rounded-xl hover:bg-destructive/20 transition-colors font-medium border border-destructive/30"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>清除数据</span>
              </button>
            </div>

            {/* 帮助信息 */}
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
