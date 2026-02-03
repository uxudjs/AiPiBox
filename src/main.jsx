import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { useI18nStore } from './i18n';
import { logger } from './services/logger';
import { useConfigStore } from './store/useConfigStore';
import { initializeEnvironment } from './utils/envDetect';

// 初始化环境配置
const envConfig = initializeEnvironment();
logger.info('main', 'Environment initialized', envConfig);

// 开发环境下加载诊断工具
if (import.meta.env.DEV) {
  import('./utils/diagnostics').then(({ runDiagnostics }) => {
    // 自动运行诊断
    setTimeout(() => {
      runDiagnostics().catch(err => {
        logger.error('main', 'Diagnostics failed', err);
      });
    }, 1000);
  });
}

// 安全初始化i18n语言设置
const initializeLanguage = () => {
  try {
    const configLanguage = useConfigStore.getState().general?.language;
    if (configLanguage) {
      useI18nStore.getState().setLanguage(configLanguage);
    }
  } catch (error) {
    logger.warn('main', 'Failed to initialize language from config, using default', error);
    // 使用默认语言
    useI18nStore.getState().setLanguage('zh-CN');
  }
};

// 添加全局错误处理
window.addEventListener('error', (event) => {
  logger.error('main', 'Global error', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  logger.error('main', 'Unhandled promise rejection', event.reason);
});

initializeLanguage();

// 渲染应用到DOM，使用ErrorBoundary包裹
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
