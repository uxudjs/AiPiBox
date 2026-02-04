import React, { useMemo } from 'react';
import AppRouter from './router/AppRouter';
import { useAppInit } from './hooks/useAppInit';
import { X, CloudOff } from 'lucide-react';

// 基础组件
import LoginScreen from './components/auth/LoginScreen';
import ErrorScreen from './components/auth/ErrorScreen';
import LoadingFallback from './components/ui/LoadingFallback';

/**
 * App - 应用根组件
 * 核心职责：管理全局初始化状态，协调认证流与路由分发
 */
function App() {
  const {
    loading,
    initError,
    syncWarning,
    setSyncWarning,
    isInitialized,
    isAuthenticated
  } = useAppInit();

  // 条件渲染逻辑映射
  const content = useMemo(() => {
    if (loading) return <LoadingFallback />;
    if (initError) return <ErrorScreen error={initError} />;
    if (!isAuthenticated) return <LoginScreen isInitialized={isInitialized} />;
    
    return (
      <>
        {/* 同步服务异常提醒（非阻塞） */}
        {syncWarning && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4 animate-in slide-in-from-top duration-300">
            <div className="bg-destructive text-destructive-foreground px-4 py-3 rounded-xl shadow-2xl flex items-center justify-between gap-3 border border-white/10">
              <div className="flex items-center gap-2">
                <CloudOff className="w-4 h-4" />
                <span className="text-sm font-medium">{syncWarning}</span>
              </div>
              <button 
                onClick={() => setSyncWarning(null)}
                className="hover:bg-white/20 p-1 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
        <AppRouter />
      </>
    );
  }, [loading, initError, isAuthenticated, isInitialized, syncWarning, setSyncWarning]);

  return content;
}

export default App;
