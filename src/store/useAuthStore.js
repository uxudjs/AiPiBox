import { create } from 'zustand';
import { hashPassword } from '../utils/crypto';
import { db } from '../db';
import { logger } from '../services/logger';

// 认证持久化存储的本地 localStorage 键名
const STORAGE_KEY = 'aipibox_auth_persist';
// 用于本地轻量混淆的盐值
const OBFUSCATE_KEY = 'AiPiBox_Secure_Salt_v1';

/**
 * 基础混淆加密
 * 用于防止在 localStorage 中以明文形式存储敏感信息
 * 注意：本方法仅防窥视，不应作为强加密手段
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
 * 混淆解密
 * 还原经过 obfuscate 方法处理过的字符串
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
 * 登录保持时长映射（毫秒）
 */
export const PERSISTENCE_OPTIONS = {
  'none': 0,
  '1d': 24 * 60 * 60 * 1000,
  '5d': 5 * 24 * 60 * 60 * 1000,
  '10d': 10 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000
};

/**
 * 认证状态 Store
 * 维护全局登录状态、加密会话与持久化策略
 */
export const useAuthStore = create((set, get) => ({
  // 状态属性
  isAuthenticated: false,   // 是否已通过身份验证
  isInitialized: false,     // 是否已初始化（即是否设置了主密码）
  sessionPassword: '',      // 会话期明文密码（仅存于内存，供后续业务加密操作使用）
  persistenceMode: 'none',  // 登录保持模式：none | 1d | 5d | 10d | 30d
  
  /**
   * 初始化检查
   * 验证主密码设置状态并尝试从本地存储恢复活跃会话
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
            
            // 执行自动登录：未过期且密码散列匹配
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
   * 初始化应用主密码
   * @param {string} password 用户设置的明文密码
   */
  setupPassword: async (password) => {
    const hash = await hashPassword(password);
    // 持久化存储哈希值，永不存储明文
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
   * 用户登录验证
   * @param {string} password 待验证的明文密码
   * @returns {Promise<boolean>} 验证通过返回 true
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
   * 配置或切换登录保持模式
   * @param {string} mode 目标持久化模式
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
   * 安全登出
   * 清除会话密码并注销持久化凭据
   */
  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ isAuthenticated: false, sessionPassword: '', persistenceMode: 'none' });
  },

  /**
   * 主密码强度校验
   * 标准：≥8位，需包含大小写、数字及特殊符号
   * @param {string} password 待校验的明文
   * @returns {boolean}
   */
  validatePassword: (password) => {
    // 允许任何标准特殊字符，不仅限于之前的有限集合
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return regex.test(password);
  }
}));
