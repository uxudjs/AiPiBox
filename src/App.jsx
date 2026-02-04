import React, { useEffect, useState } from 'react';
import MainLayout from './components/layout/MainLayout';
import ChatArea from './components/chat/ChatArea';
import PublishedPage from './components/chat/PublishedPage';
import { useAuthStore } from './store/useAuthStore';
import { useChatStore } from './store/useChatStore';
import { useConfigStore } from './store/useConfigStore';
import { ShieldAlert, Lock, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { syncService } from './services/syncService';
import { useTranslation } from './i18n';
import { logger } from './services/logger';

function App() {
  const { t } = useTranslation();
  const { isAuthenticated, isInitialized, checkInit, setupPassword, login, validatePassword, sessionPassword } = useAuthStore();
  const { loadConfig, applyTheme, loadTheme } = useConfigStore();
  const chatStore = useChatStore();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [publishId, setPublishId] = useState(null);
  const [initError, setInitError] = useState(null);

  /**
   * 应用生命周期：冷启动初始化
   * 负责探测路由（是否为公开分享页）、加载 UI 主题、验证 IndexedDB 连通性及主密码设置状态
   */
  useEffect(() => {
    const initApp = async () => {
      const path = window.location.pathname;
      const isPublishPath = path.startsWith('/publish/');

      try {
        // 并行执行非阻塞的主题加载与核心状态检查
        await Promise.all([
          loadTheme().catch(err => {
            logger.error('App', 'Failed to load theme:', err);
          }),
          isPublishPath ? Promise.resolve() : checkInit().catch(err => {
            logger.error('App', 'Failed to check init:', err);
            throw err;
          })
        ]);

        if (isPublishPath) {
          setPublishId(path.split('/')[2]);
        }
      } catch (err) {
        logger.error('App', 'Application initialization failed:', err);
        setInitError(err.message || t('app.initFailed'));
      } finally {
        setLoading(false);
      }
    };

    initApp();
  }, []);

  /**
   * 业务初始化：解锁后加载配置
   * 当用户成功登录且密码进入内存会话后，触发加密配置读取与同步服务挂载
   */
  useEffect(() => {
    const initConfigAndSync = async () => {
      if (isAuthenticated && sessionPassword) {
        try {
          // 依赖会话密码解密持久化配置
          await loadConfig(sessionPassword);
        } catch (err) {
          logger.error('App', 'Failed to load config:', err);
        }
        
        try {
          // 启动云同步后台监听
          if (syncService && typeof syncService.init === 'function') {
            await syncService.init();
          }
        } catch (e) {
          logger.error('App', 'Failed to init sync service:', e);
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

  // 显示初始化错误
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

  if (publishId) {
    return <PublishedPage id={publishId} />;
  }

  if (!isAuthenticated) {
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

  return (
    MainLayout ? (
      <MainLayout>
        <ChatArea />
      </MainLayout>
    ) : null
  );
}

export default App;
