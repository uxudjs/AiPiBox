import React, { useEffect, useState } from 'react';
import AppRouter from './router/AppRouter';
import { useAuthStore } from './store/useAuthStore';
import { useConfigStore } from './store/useConfigStore';
import { ShieldAlert, Lock, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { syncService } from './services/syncService';
import { useTranslation } from './i18n';
import { logger } from './services/logger';

/**
 * 应用根组件
 * 负责核心生命周期管理：初始化检查、身份验证（主密码解锁）及基础服务挂载
 */
function App() {
  const { t } = useTranslation();
  const { 
    isAuthenticated, 
    isInitialized, 
    checkInit, 
    setupPassword, 
    login, 
    validatePassword, 
    sessionPassword 
  } = useAuthStore();
  const { loadConfig, loadTheme } = useConfigStore();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [initError, setInitError] = useState(null);

  /**
   * 初始化核心状态
   */
  useEffect(() => {
    const initApp = async () => {
      try {
        await Promise.all([
          loadTheme().catch(err => logger.error('App', 'Theme load error:', err)),
          checkInit().catch(err => {
            logger.error('App', 'Init check error:', err);
            throw err;
          })
        ]);
      } catch (err) {
        setInitError(err.message || t('app.initFailed'));
      } finally {
        setLoading(false);
      }
    };

    initApp();
  }, []);

  /**
   * 解锁后加载配置与服务
   */
  useEffect(() => {
    const initConfigAndSync = async () => {
      if (isAuthenticated && sessionPassword) {
        try {
          await loadConfig(sessionPassword);
          if (syncService?.init) {
            await syncService.init();
          }
        } catch (err) {
          logger.error('App', 'Config/Sync init error:', err);
        }
      }
    };
    
    initConfigAndSync();
  }, [isAuthenticated, sessionPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!isInitialized) {
      if (!validatePassword(password)) {
        setError(t('auth.passwordWeak'));
        return;
      }
      await setupPassword(password);
    } else {
      const success = await login(password);
      if (!success) setError(t('auth.passwordError'));
    }
  };

  if (loading) return null;

  // 渲染错误状态
  if (initError) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full space-y-6 bg-card p-8 rounded-2xl shadow-xl border border-destructive/20">
          <div className="text-center space-y-3">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold text-destructive">初始化失败</h2>
            <p className="text-sm text-muted-foreground">{initError}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:opacity-90 transition-opacity"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  // 身份验证拦截
  if (!isAuthenticated) {
    // 如果是公开分享路径，可能需要特殊处理，但目前 AppRouter 会处理跳转
    // 这里的逻辑保持不变，确保未解锁前无法进入主界面
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full space-y-8 bg-card p-8 rounded-2xl shadow-xl border">
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              {isInitialized ? <Lock className="w-6 h-6 text-primary" /> : <ShieldAlert className="w-6 h-6 text-primary" />}
            </div>
            <h2 className="text-2xl font-bold">
              {isInitialized ? t('auth.welcomeBack') : t('auth.initSecurity')}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isInitialized ? t('auth.unlockHint') : t('auth.setupHint')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.passwordPlaceholder')}
                className="w-full px-4 py-3 bg-accent rounded-xl border-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
              {error && <p className="text-xs text-destructive px-2 pt-1">{error}</p>}
            </div>
            
            {!isInitialized && (
              <div className="text-[10px] text-muted-foreground bg-accent/30 p-3 rounded-lg flex gap-2">
                <ShieldCheck className="w-4 h-4 flex-shrink-0 text-primary" />
                <span>{t('auth.encryptionNote')}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              {isInitialized ? t('auth.unlock') : t('auth.start')}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 认证通过后渲染路由
  return <AppRouter />;
}

export default App;
