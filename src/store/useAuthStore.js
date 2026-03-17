/**
 * 认证状态 Store
 * 维护全局登录状态、会话密码及登录保持策略，确保数据解密环境可用。
 */

import { create } from 'zustand';
import { hashPassword, encryptData, decryptData } from '../utils/crypto';
import { db } from '../db';
import { logger } from '../services/logger';

const STORAGE_KEY = 'aipibox_auth_persist';

/**
 * 派生本地设备绑定密钥
 * 基于当前域名与 UserAgent 生成一个只在本环境有效的加密密钥，
 * 确保 localStorage 数据即使被提取也无法在其他环境解密。
 * @returns {Promise<string>} 十六进制指纹字符串
 */
const deriveDeviceKey = async () => {
  const raw = `${location.origin}::${navigator.userAgent}`;
  const enc = new TextEncoder();
  const hash = await crypto.subtle.digest('SHA-256', enc.encode(raw));
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0')).join('');
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
            const { c: encryptedPass, e: expiry, m: mode } = JSON.parse(persisted);
            
            if (expiry > Date.now()) {
              const deviceKey = await deriveDeviceKey();
              const password = await decryptData(encryptedPass, deviceKey);
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
  setPersistence: async (mode) => {
    const { sessionPassword, isAuthenticated } = get();
    
    if (!isAuthenticated || !sessionPassword) return;

    if (mode === 'none' || !PERSISTENCE_OPTIONS[mode]) {
      localStorage.removeItem(STORAGE_KEY);
      set({ persistenceMode: 'none' });
      return;
    }

    try {
      const duration = PERSISTENCE_OPTIONS[mode];
      const expiry = Date.now() + duration;
      const deviceKey = await deriveDeviceKey();
      const encryptedPass = await encryptData(sessionPassword, deviceKey);
      
      const data = {
        c: encryptedPass,
        e: expiry,
        m: mode
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      set({ persistenceMode: mode });
    } catch (e) {
      logger.error('useAuthStore', 'Failed to persist login state', e);
    }
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