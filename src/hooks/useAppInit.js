import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useConfigStore } from '../store/useConfigStore';
import { syncService } from '../services/syncService';
import { useTranslation } from '../i18n';
import { logger } from '../services/logger';
import { APP_INIT_TIMEOUT } from '../utils/constants';

/**
 * useAppInit Hook
 * 集中管理应用初始化生命周期：主题加载、认证检查、配置加载及同步服务启动
 */
export const useAppInit = () => {
  const { t } = useTranslation();
  const { isAuthenticated, isInitialized, checkInit, sessionPassword } = useAuthStore();
  const { loadConfig, loadTheme } = useConfigStore();
  
  const [loading, setLoading] = useState(true);
  const [initError, setInitError] = useState(null);
  const [syncWarning, setSyncWarning] = useState(null);

  // 第一阶段：基础环境初始化
  useEffect(() => {
    const initBase = async () => {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error(t('app.initTimeout') || '初始化超时')), APP_INIT_TIMEOUT)
      );

      const loadPromise = Promise.all([
        loadTheme().catch(err => logger.error('useAppInit', 'Theme load error', err)),
        checkInit().catch(err => {
          logger.error('useAppInit', 'Init check error', err);
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

    initBase();
  }, [checkInit, loadTheme, t]);

  // 第二阶段：解锁后加载用户配置与同步服务
  useEffect(() => {
    let isMounted = true;
    
    const initUserServices = async () => {
      if (isAuthenticated && sessionPassword) {
        try {
          await loadConfig(sessionPassword);
          if (syncService?.init) {
            await syncService.init();
          }
        } catch (err) {
          logger.error('useAppInit', 'User services init error', err);
          if (isMounted) {
            setSyncWarning(t('app.syncInitFailed') || '同步服务启动失败');
          }
        }
      }
    };
    
    initUserServices();
    return () => { isMounted = false; };
  }, [isAuthenticated, sessionPassword, loadConfig, t]);

  return {
    loading,
    initError,
    syncWarning,
    setSyncWarning,
    isInitialized,
    isAuthenticated
  };
};
