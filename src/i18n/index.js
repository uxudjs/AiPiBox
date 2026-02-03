// 国际化(i18n)核心系统
import { create } from 'zustand';
import { translations } from './translations';
import { logger } from '../services/logger';

// 支持的语言列表
export const SUPPORTED_LANGUAGES = [
  { value: 'zh-CN', label: '简体中文', nativeName: '简体中文' },
  { value: 'zh-TW', label: '繁體中文', nativeName: '繁體中文' },
  { value: 'en-US', label: 'English', nativeName: 'English' },
  { value: 'ja-JP', label: '日本語', nativeName: '日本語' },
  { value: 'ko-KR', label: '한국어', nativeName: '한국어' }
];

/**
 * 国际化状态 Store
 * 维护当前系统语言并提供全局翻译调度函数
 */
export const useI18nStore = create((set, get) => ({
  currentLanguage: 'zh-CN',
  
  // 设置当前语言
  setLanguage: (language) => {
    if (SUPPORTED_LANGUAGES.find(lang => lang.value === language)) {
      set({ currentLanguage: language });
      // 触发语言变更事件，通知其他组件
      window.dispatchEvent(new CustomEvent('language-changed', { detail: { language } }));
    }
  },
  
  // 获取当前语言
  getLanguage: () => get().currentLanguage,
  
  /**
   * 翻译执行函数
   * 支持通过点号（.）分隔的路径查找翻译词条，并实现插值参数替换
   */
  t: (key, params = {}) => {
    try {
      const { currentLanguage } = get();
      const keys = key.split('.');
      let value = translations[currentLanguage];
      
      // 深度查找翻译键
      for (const k of keys) {
        if (value && typeof value === 'object') {
          value = value[k];
        } else {
          // Translation key not found
          logger.debug('i18n', `Translation key not found: ${key} for language: ${currentLanguage}`);
          return key;
        }
      }
      
      // 如果找到的不是字符串，返回键名
      if (typeof value !== 'string') {
        logger.debug('i18n', `Translation value is not a string: ${key}`);
        return key;
      }
      
      // 替换参数
      let result = value;
      Object.keys(params).forEach(param => {
        result = result.replace(new RegExp(`{${param}}`, 'g'), params[param]);
      });
      
      return result;
    } catch (error) {
      logger.error('i18n', `Translation error for key "${key}"`, error);
      return key; // 发生错误时返回键名
    }
  }
}));

// React Hook for easy translation access
export const useTranslation = () => {
  const { t, currentLanguage, setLanguage } = useI18nStore();
  return { t, currentLanguage, setLanguage };
};
