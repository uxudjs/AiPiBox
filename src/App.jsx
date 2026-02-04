import React, { useEffect, useState, useMemo } from 'react';
import AppRouter from './router/AppRouter';
import { useAuthStore } from './store/useAuthStore';
import { useConfigStore } from './store/useConfigStore';
import { syncService } from './services/syncService';
import { useTranslation } from './i18n';
import { logger } from './services/logger';
import { APP_INIT_TIMEOUT } from './utils/constants';
import { X, CloudOff } from 'lucide-react';

// 动态导入拆分出的组件以优化首屏性能
import LoginScreen from './components/auth/LoginScreen';
import ErrorScreen from './components/auth/ErrorScreen';
import LoadingFallback from './components/ui/LoadingFallback';

/**
 * 应用根组件
 * 负责核心生命周期管理：初始化检查、身份验证及基础服务挂载
 */
function App() {
  const { t } = useTranslation();
  const { 
    isAuthenticated, 
    isInitialized, 
    checkInit, 
    sessionPassword 
  } = useAuthStore();
  const { loadConfig, loadTheme } = useConfigStore();
  
  const [loading, setLoading] = useState(true);
  const [initError, setInitError] = useState(null);
  const [syncWarning, setSyncWarning] = useState(null);

  /**
   * 初始化核心状态，包含超时控制
   */
  useEffect(() => {
    const initApp = async () => {
      // 创建一个超时的 Promise
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error(t('app.initTimeout') || '初始化超时，请刷新重试')), APP_INIT_TIMEOUT)
      );

      // 并行加载主题和检查状态
      const loadPromise = Promise.all([
        loadTheme().catch(err => logger.error('App', 'Theme load error:', err)),
        checkInit().catch(err => {
          logger.error('App', 'Init check error:', err);
          throw err;
        })
      ]);

      try {
        await Promise.race([loadPromise, timeoutPromise]);
      } catch (err) {
        setInitError(err.message || t('app.initFailed'));
      } finally {
        setLoading(false);
      }
    };

    initApp();
  }, [checkInit, loadTheme, t]);

  /**
   * 解锁后加载配置与云同步服务
   */
  useEffect(() => {
    let isMounted = true;
    
    const initConfigAndSync = async () => {
      if (isAuthenticated && sessionPassword) {
        try {
          await loadConfig(sessionPassword);
          if (syncService?.init) {
            await syncService.init();
          }
        } catch (err) {
          logger.error('App', 'Config/Sync init error:', err);
          if (isMounted) {
            setSyncWarning(t('app.syncInitFailed') || '同步服务启动失败，部分功能可能受限');
          }
        }
      }
    };
    
    initConfigAndSync();
    return () => { isMounted = false; };
  }, [isAuthenticated, sessionPassword, loadConfig, t]);

  /**
   * 条件渲染逻辑映射
   */
  const content = useMemo(() => {
    if (loading) return <LoadingFallback />;
    if (initError) return <ErrorScreen error={initError} />;
    if (!isAuthenticated) return <LoginScreen isInitialized={isInitialized} />;
    
    return (
      <>
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
  }, [loading, initError, isAuthenticated, isInitialized, syncWarning]);

  return content;
}

export default App;
