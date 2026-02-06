/**
 * 应用初始化生命周期钩子
 * 集中管理主题加载、认证检查、配置恢复及同步服务启动等核心初始化逻辑。
 */

import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useConfigStore } from '../store/useConfigStore';
import { useChatStore } from '../store/useChatStore';
import { syncService } from '../services/syncService';
import { useTranslation } from '../i18n';
import { logger } from '../services/logger';
import { APP_INIT_TIMEOUT } from '../utils/constants';

/**
 * 管理应用全局初始化流程
 * @returns {object} 初始化状态包含 loading, error, warning 及认证标识
 */
export const useAppInit = () => {
  const { t } = useTranslation();
  const { isAuthenticated, isInitialized, checkInit, sessionPassword } = useAuthStore();
  const { loadConfig, loadTheme } = useConfigStore();
  
  const [loading, setLoading] = useState(true);
  const [initError, setInitError] = useState(null);
  const [syncWarning, setSyncWarning] = useState(null);

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
        logger.info('useAppInit', 'Base environment initialized successfully');
      } catch (err) {
        logger.error('useAppInit', 'Base environment initialization failed', err);
        setInitError(err.message || t('app.initFailed'));
      } finally {
        setLoading(false);
      }
    };

    initBase();
  }, [checkInit, loadTheme, t]);

  useEffect(() => {
    let isMounted = true;
    
    const initUserServices = async () => {
      if (isAuthenticated && sessionPassword) {
        try {
          await loadConfig(sessionPassword);
          
          useChatStore.getState().resumePendingTasks().catch(err => 
            logger.error('useAppInit', 'Task resumption error', err)
          );

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