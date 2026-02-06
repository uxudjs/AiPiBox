/**
 * 认证状态 Store
 * 维护全局登录状态、会话密码及登录保持策略，确保数据解密环境可用。
 */

import { create } from 'zustand';
import { hashPassword } from '../utils/crypto';
import { db } from '../db';
import { logger } from '../services/logger';

const STORAGE_KEY = 'aipibox_auth_persist';
const OBFUSCATE_KEY = 'AiPiBox_Secure_Salt_v1';

/**
 * 基础字符混淆
 * @param {string} text - 原始文本
 * @returns {string} 混淆后的十六进制字符串
 */
const obfuscate = (text) => {
  try {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ OBFUSCATE_KEY.charCodeAt(i % OBFUSCATE_KEY.length);
      result += charCode.toString(16).padStart(4, '0');
    }
    return result;
  } catch (e) {
    logger.error('useAuthStore', 'Obfuscation failed', e);
    return '';
  }
};

/**
 * 还原混淆字符
 * @param {string} hex - 混淆后的字符串
 * @returns {string} 还原后的文本
 */
const deobfuscate = (hex) => {
  try {
    let result = '';
    for (let i = 0; i < hex.length; i += 4) {
      const charCode = parseInt(hex.substring(i, i + 4), 16);
      result += String.fromCharCode(charCode ^ OBFUSCATE_KEY.charCodeAt((i / 4) % OBFUSCATE_KEY.length));
    }
    return result;
  } catch (e) {
    logger.error('useAuthStore', 'Deobfuscation failed', e);
    return '';
  }
};

/**
 * 登录保持时长配置 (毫秒)
 */
export const PERSISTENCE_OPTIONS = {
  'none': 0,
  '1d': 24 * 60 * 60 * 1000,
  '5d': 5 * 24 * 60 * 60 * 1000,
  '10d': 10 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000
};

export const useAuthStore = create((set, get) => ({
  isAuthenticated: false,
  isInitialized: false,
  sessionPassword: '',
  persistenceMode: 'none',
  
  /**
   * 检查应用初始化状态及尝试自动登录
   */
  checkInit: async () => {
    try {
      const passwordHash = await db.settings.get('passwordHash');
      const isInitialized = !!passwordHash;
      
      if (isInitialized) {
        try {
          const persisted = localStorage.getItem(STORAGE_KEY);
          if (persisted) {
            const { p: encodedPass, e: expiry, m: mode } = JSON.parse(persisted);
            
            if (expiry > Date.now()) {
              const password = deobfuscate(encodedPass);
              const inputHash = await hashPassword(password);
              if (passwordHash.value === inputHash) {
                set({ 
                  isInitialized: true, 
                  isAuthenticated: true, 
                  sessionPassword: password,
                  persistenceMode: mode || 'none'
                });
                return;
              }
            }
            localStorage.removeItem(STORAGE_KEY);
          }
        } catch (e) {
          logger.error('useAuthStore', 'Auto login failed', e);
          localStorage.removeItem(STORAGE_KEY);
        }
      }

      set({ isInitialized });
    } catch (error) {
      logger.error('useAuthStore', 'Failed to check initialization', error);
      set({ isInitialized: false });
      throw new Error('无法访问数据库，请检查浏览器设置');
    }
  },

  /**
   * 设置初始主密码
   * @param {string} password - 原始明文密码
   */
  setupPassword: async (password) => {
    const hash = await hashPassword(password);
    await db.settings.put({ key: 'passwordHash', value: hash });
    localStorage.removeItem(STORAGE_KEY);
    set({ 
      isInitialized: true, 
      isAuthenticated: true, 
      sessionPassword: password,
      persistenceMode: 'none'
    });
  },

  /**
   * 执行登录验证
   * @param {string} password - 待验证明文密码
   * @returns {Promise<boolean>} 是否登录成功
   */
  login: async (password) => {
    const passwordHash = await db.settings.get('passwordHash');
    const inputHash = await hashPassword(password);
    if (passwordHash && passwordHash.value === inputHash) {
      set({ isAuthenticated: true, sessionPassword: password });
      return true;
    }
    return false;
  },

  /**
   * 设置登录保持策略
   * @param {string} mode - 持久化模式标识
   */
  setPersistence: (mode) => {
    const { sessionPassword, isAuthenticated } = get();
    
    if (!isAuthenticated || !sessionPassword) return;

    if (mode === 'none' || !PERSISTENCE_OPTIONS[mode]) {
      localStorage.removeItem(STORAGE_KEY);
      set({ persistenceMode: 'none' });
      return;
    }

    const duration = PERSISTENCE_OPTIONS[mode];
    const expiry = Date.now() + duration;
    const encodedPass = obfuscate(sessionPassword);
    
    const data = {
      p: encodedPass,
      e: expiry,
      m: mode
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    set({ persistenceMode: mode });
  },

  /**
   * 登出并清除会话凭据
   */
  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ isAuthenticated: false, sessionPassword: '', persistenceMode: 'none' });
  },

  /**
   * 校验密码强度
   * @param {string} password - 待校验密码
   * @returns {boolean} 是否符合复杂度要求
   */
  validatePassword: (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return regex.test(password);
  }
}));