/**
 * 配置项 Store
 * 维护 AI 提供商、场景模型绑定、通用偏好、网络代理及云同步等全局设置。
 */

import { create } from 'zustand';
import { db } from '../db';
import { encryptData, decryptData } from '../utils/crypto';
import { logger } from '../services/logger';
import { useI18nStore } from '../i18n';

export const DEFAULT_PROVIDERS = [
  { id: 'openai', name: 'OpenAI', baseUrl: 'https://api.openai.com/v1', apiKey: '', enabled: true, models: [], format: 'openai' },
  { id: 'anthropic', name: 'Claude', baseUrl: 'https://api.anthropic.com', apiKey: '', enabled: false, models: [], format: 'claude' },
  { id: 'google', name: 'Gemini', baseUrl: 'https://generativelanguage.googleapis.com/v1beta', apiKey: '', enabled: false, models: [], format: 'gemini' },
  { id: 'deepseek', name: 'DeepSeek', baseUrl: 'https://api.deepseek.com/v1', apiKey: '', enabled: false, models: [], format: 'openai' },
  { id: 'siliconflow', name: 'Silicon Flow', baseUrl: 'https://api.siliconflow.cn/v1', apiKey: '', enabled: false, models: [], format: 'openai' },
  { id: 'openrouter', name: 'OpenRouter', baseUrl: 'https://openrouter.ai/api/v1', apiKey: '', enabled: false, models: [], format: 'openai' },
  { id: 'ollama', name: 'Ollama', baseUrl: 'http://localhost:11434', apiKey: '', enabled: false, models: [], format: 'openai' },
  { id: 'mistral', name: 'Mistral AI', baseUrl: 'https://api.mistral.ai/v1', apiKey: '', enabled: false, models: [], format: 'openai' },
  { id: 'groq', name: 'Groq', baseUrl: 'https://api.groq.com/openai/v1', apiKey: '', enabled: false, models: [], format: 'openai' },
  { id: 'perplexity', name: 'Perplexity', baseUrl: 'https://api.perplexity.ai', apiKey: '', enabled: false, models: [], format: 'openai' },
  { id: 'xai', name: 'XAI (Grok)', baseUrl: 'https://api.x.ai/v1', apiKey: '', enabled: false, models: [], format: 'openai' },

  { id: 'aliyun', name: 'Aliyun (Qwen)', baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1', apiKey: '', enabled: false, models: [], format: 'openai', region: 'china' },
  { id: 'chatglm', name: 'ChatGLM', baseUrl: 'https://open.bigmodel.cn/api/paas/v4', apiKey: '', enabled: false, models: [], format: 'openai' },
  { id: 'volcengine', name: 'VolcEngine', baseUrl: 'https://ark.cn-beijing.volces.com/api/v3', apiKey: '', enabled: false, models: [], format: 'openai' },
  { id: 'azure', name: 'Azure OpenAI', baseUrl: '', apiKey: '', enabled: false, models: [], format: 'openai' },
  { id: 'lmstudio', name: 'LM Studio', baseUrl: 'http://localhost:1234/v1', apiKey: '', enabled: false, models: [], format: 'openai' },
];

/**
 * 阿里云服务器区域配置映射
 */
export const ALIYUN_REGIONS = {
  china: {
    name: 'region.china',
    url: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
  },
  singapore: {
    name: 'region.singapore',
    url: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1'
  },
  us: {
    name: 'region.us',
    url: 'https://dashscope-us.aliyuncs.com/compatible-mode/v1'
  }
};

/**
 * 获取阿里云提供商对应的区域 Base URL
 * @param {object} provider - 提供商对象
 * @returns {string} 目标 URL
 */
export const getAliyunRegionUrl = (provider) => {
  if (provider.id !== 'aliyun') {
    return provider.baseUrl;
  }
  
  const presetUrls = Object.values(ALIYUN_REGIONS).map(r => r.url);
  if (provider.baseUrl && !presetUrls.includes(provider.baseUrl)) {
    return provider.baseUrl;
  }
  
  const region = provider.region || 'china';
  return ALIYUN_REGIONS[region]?.url || ALIYUN_REGIONS.china.url;
};

export const useConfigStore = create((set, get) => ({
  providers: DEFAULT_PROVIDERS,
  
  defaultModels: {
    chat: '',
    naming: '',
    search: '',
    compression: '',
    ocr: ''
  },
  
  general: {
    language: 'zh-CN',
    theme: 'system',
    fontSize: 14,
    autoRender: true
  },
  
  proxy: {
    enabled: false, 
    url: '/api/proxy',
    cloudUrl: '',
    encryptKey: true,
    timeout: 30
  },
  
  cloudSync: {
    enabled: false,
    syncImages: false,
    lastSyncTime: 0,
    autoSync: true,
    apiUrl: '',
    syncStatus: 'idle',
    lastError: null,
    syncProgress: {
      current: 0,
      total: 0,
      currentType: ''
    }
  },
  
  searchSettings: {
    enabled: false,
    engine: 'bing',
    apiKey: '',
  },
  
  conversationPresets: {
    systemPrompt: '',
    contextLimit: null,
    temperature: null,
    topP: null,
    topK: null,
    frequencyPenalty: null,
    presencePenalty: null,
    maxTokens: null,
    stream: true
  },
  conversationSettings: {
    display: {
      showWordCount: true,
      showTokenCount: true,
      showModelName: true
    },
    features: {
      autoCollapseCode: true,
      autoGenerateTitle: true,
      spellCheck: true,
      markdownRender: true,
      latexRender: true,
      mermaidRender: true,
      autoPreviewArtifacts: false,
      pasteAsFile: true
    },
    compression: {
      autoCompress: false,
      autoCompressThreshold: 50
    }
  },

  /**
   * 加载 UI 主题设置
   */
  loadTheme: async () => {
    try {
      const themeSetting = await db.settings.get('theme');
      if (themeSetting && themeSetting.value) {
        set((state) => ({
          general: { ...state.general, theme: themeSetting.value }
        }));
      }
      get().applyTheme();
      await get().loadSyncStatus();
    } catch (e) {
      logger.error('ConfigStore', 'Failed to load theme', e);
      get().applyTheme();
    }
  },

  /**
   * 加载同步状态（非加密）
   */
  loadSyncStatus: async () => {
    try {
      const status = await db.settings.get('syncStatus');
      if (status && status.value) {
        set((state) => ({
          cloudSync: { ...state.cloudSync, ...status.value }
        }));
      }
    } catch (e) {
      logger.error('ConfigStore', 'Failed to load sync status', e);
    }
  },

  /**
   * 持久化同步状态
   * @param {object} [syncData] - 同步状态对象
   */
  saveSyncStatus: async (syncData) => {
    try {
      const { lastSyncTime, syncStatus, lastError } = syncData || get().cloudSync;
      await db.settings.put({ 
        key: 'syncStatus', 
        value: { lastSyncTime, syncStatus, lastError } 
      });
    } catch (e) {
      logger.error('ConfigStore', 'Failed to save sync status', e);
    }
  },

  /**
   * 持久化主题设置
   * @param {string} theme - 主题标识
   */
  saveTheme: async (theme) => {
    try {
      await db.settings.put({ key: 'theme', value: theme });
    } catch (e) {
      logger.error('ConfigStore', 'Failed to save theme', e);
    }
  },

  /**
   * 加载并解密主配置
   * @param {string} password - 解密密码
   */
  loadConfig: async (password) => {
    const encrypted = await db.settings.get('config');
    if (encrypted) {
      try {
        const config = await decryptData(encrypted.value, password);
        const mergedProviders = [
          ...DEFAULT_PROVIDERS.map(dp => {
            const saved = config.providers?.find(sp => sp.id === dp.id);
            return saved ? { ...dp, ...saved, models: Array.isArray(saved.models) ? saved.models : [] } : dp;
          }),
          ...(config.providers?.filter(p => !DEFAULT_PROVIDERS.find(dp => dp.id === p.id)).map(p => ({
            ...p,
            models: Array.isArray(p.models) ? p.models : []
          })) || [])
        ];
        set({ ...config, providers: mergedProviders });
        get().applyTheme();
        
        if (config.general?.language) {
          useI18nStore.getState().setLanguage(config.general.language);
        }
      } catch (e) {
        logger.error('ConfigStore', 'Failed to decrypt config', e);
      }
    }
  },

  /**
   * 加密并保存主配置
   * @param {string} password - 加密密码
   */
  saveConfig: async (password) => {
    const { providers, defaultModels, general, proxy, searchSettings, conversationPresets, conversationSettings, cloudSync } = get();
    const config = { providers, defaultModels, general, proxy, searchSettings, conversationPresets, conversationSettings, cloudSync };
    const encrypted = await encryptData(config, password);
    await db.settings.put({ key: 'config', value: encrypted });
    await get().saveTheme(general.theme);
  },

  /**
   * 添加自定义提供商
   * @param {object} provider - 提供商配置
   */
  addCustomProvider: (provider) => set((state) => ({
    providers: [...state.providers, { ...provider, id: `custom-${Date.now()}`, enabled: true, models: [], format: provider.format || 'openai' }]
  })),

  /**
   * 切换模型的启用状态
   * @param {string} providerId - 提供商 ID
   * @param {string} modelId - 模型 ID
   */
  toggleModelSelection: (providerId, modelId) => set((state) => {
    const providers = state.providers.map(p => {
      if (p.id === providerId) {
        const models = p.models.map(m => {
          if (m.id === modelId) {
            const currentSelected = m.selected === true;
            return { ...m, selected: !currentSelected };
          }
          return m;
        });
        return { ...p, models };
      }
      return p;
    });
    return { providers };
  }),

  /**
   * 更新模型功能标志位
   * @param {string} providerId - 提供商 ID
   * @param {string} modelId - 模型 ID
   * @param {object} updates - 待更新字段
   */
  updateModelCapability: (providerId, modelId, updates) => set((state) => {
    const providers = state.providers.map(p => {
      if (p.id === providerId) {
        const models = p.models.map(m => {
          if (m.id === modelId) {
            return { ...m, capabilities: { ...m.capabilities, ...updates } };
          }
          return m;
        });
        return { ...p, models };
      }
      return p;
    });
    return { providers };
  }),

  /**
   * 更新模型元数据
   * @param {string} providerId - 提供商 ID
   * @param {string} modelId - 模型 ID
   * @param {object} updates - 待更新字段
   */
  updateModelInfo: (providerId, modelId, updates) => set((state) => {
    const providers = state.providers.map(p => {
      if (p.id === providerId) {
        const models = p.models.map(m => {
          if (m.id === modelId) {
            return { ...m, ...updates };
          }
          return m;
        });
        return { ...p, models };
      }
      return p;
    });
    return { providers };
  }),

  /**
   * 添加自定义模型到指定提供商
   * @param {string} providerId - 提供商 ID
   * @param {object} model - 模型定义
   */
  addCustomModel: (providerId, model) => set((state) => {
    const providers = state.providers.map(p => {
      if (p.id === providerId) {
        return { 
          ...p, 
          models: [...(p.models || []), { 
            ...model, 
            id: model.id || `custom-${Date.now()}`,
            selected: false,
            capabilities: model.capabilities || { thinking: false, multimodal: false, tools: false, imageGen: false }
          }] 
        };
      }
      return p;
    });
    return { providers };
  }),

  /**
   * 删除指定模型
   * @param {string} providerId - 提供商 ID
   * @param {string} modelId - 模型 ID
   */
  deleteModel: (providerId, modelId) => set((state) => {
    const providers = state.providers.map(p => {
      if (p.id === providerId) {
        return { ...p, models: p.models.filter(m => m.id !== modelId) };
      }
      return p;
    });
    return { providers };
  }),

  /**
   * 移除自定义提供商
   * @param {string} id - 提供商 ID
   */
  removeProvider: (id) => set((state) => ({
    providers: state.providers.filter(p => p.id !== id || DEFAULT_PROVIDERS.find(dp => dp.id === id))
  })),

  /**
   * 更新提供商核心配置
   * @param {string} id - 提供商 ID
   * @param {object} updates - 待更新字段
   */
  updateProvider: (id, updates) => set((state) => ({
    providers: state.providers.map(p => p.id === id ? { ...p, ...updates } : p)
  })),

  /**
   * 更新代理配置
   * @param {object} updates - 设置项
   */
  updateProxy: (updates) => {
    set((state) => ({
      proxy: { ...state.proxy, ...updates }
    }));
  },
  
  /**
   * 更新云端同步配置并触发服务状态变更
   * @param {object} updates - 设置项
   */
  updateCloudSync: async (updates) => {
    if (updates.enabled === true) {
      const { syncService } = await import('../services/syncService');
      syncService.checkProxyHealth(true).then(isAvailable => {
        if (!isAvailable) {
          logger.warn('ConfigStore', 'Cloud sync enabled but sync server is not currently available');
        }
      });
      syncService.startProxyHealthMonitoring();
    } else if (updates.enabled === false) {
      import('../services/syncService').then(({ syncService }) => {
        syncService.stopProxyHealthMonitoring();
      });
    }
    
    set((state) => {
      const newCloudSync = { ...state.cloudSync, ...updates };
      get().saveSyncStatus(newCloudSync);
      return { cloudSync: newCloudSync };
    });
  },

  /**
   * 更新通用设置
   * @param {object} updates - 设置项
   */
  updateGeneral: (updates) => {
    set((state) => ({
      general: { ...state.general, ...updates }
    }));
    get().applyTheme();
    
    if (updates.theme) {
      get().saveTheme(updates.theme);
    }
    
    if (updates.language) {
      useI18nStore.getState().setLanguage(updates.language);
    }
  },

  /**
   * 更新业务场景的默认模型映射
   * @param {object} updates - 场景模型映射表
   */
  updateDefaultModels: (updates) => set((state) => ({
    defaultModels: { ...state.defaultModels, ...updates }
  })),

  /**
   * 更新联网搜索配置
   * @param {object} updates - 设置项
   */
  updateSearchSettings: (updates) => set((state) => ({
    searchSettings: { ...state.searchSettings, ...updates }
  })),

  /**
   * 更新对话参数预设
   * @param {object} updates - 设置项
   */
  updateConversationPresets: (updates) => set((state) => ({
    conversationPresets: { ...state.conversationPresets, ...updates }
  })),

  /**
   * 将对话预设重置为全局默认值
   */
  resetConversationPresets: () => set({
    conversationPresets: {
      systemPrompt: '',
      contextLimit: null,
      temperature: null,
      topP: null,
      topK: null,
      frequencyPenalty: null,
      presencePenalty: null,
      maxTokens: null,
      stream: true
    }
  }),

  /**
   * 更新会话交互设置
   * @param {object} updates - 设置项
   */
  updateConversationSettings: (updates) => set((state) => ({
    conversationSettings: { 
      ...state.conversationSettings,
      display: { ...state.conversationSettings.display, ...(updates.display || {}) },
      features: { ...state.conversationSettings.features, ...(updates.features || {}) },
      compression: { ...state.conversationSettings.compression, ...(updates.compression || {}) }
    }
  })),

  /**
   * 应用当前主题颜色到 HTML 根节点
   */
  applyTheme: () => {
    const theme = get().general?.theme || 'system';
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    const updateTheme = (isDark) => {
      root.classList.remove('light', 'dark');
      root.classList.add(isDark ? 'dark' : 'light');
    };

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      updateTheme(mediaQuery.matches);
      
      mediaQuery.onchange = (e) => {
        if (get().general.theme === 'system') {
          updateTheme(e.matches);
        }
      };
    } else {
      updateTheme(theme === 'dark');
    }
  },

  /**
   * 根据业务目的获取最匹配的可用模型
   * @param {string} purpose - 场景标识 (chat, naming, search, ocr)
   * @param {object} [currentModel] - 当前对话选中的模型作为备选
   * @returns {object|null} 匹配到的模型信息
   */
  getEffectiveModel: (purpose, currentModel = null) => {
    const { defaultModels, providers } = get();
    
    const configuredModelId = defaultModels[purpose];
    
    if (configuredModelId && configuredModelId !== 'null' && configuredModelId !== '') {
      for (const provider of providers) {
        if (provider.apiKey && provider.models) {
          const model = provider.models.find(m => m.id === configuredModelId);
          if (model) {
            return {
              providerId: provider.id,
              modelId: configuredModelId,
              provider,
              source: 'configured'
            };
          }
        }
      }
    }
    
    if (currentModel && currentModel.providerId && currentModel.modelId) {
      const provider = providers.find(p => p.id === currentModel.providerId);
      if (provider && provider.apiKey) {
        const model = provider.models?.find(m => m.id === currentModel.modelId);
        if (model) {
          return {
            providerId: currentModel.providerId,
            modelId: currentModel.modelId,
            provider,
            source: 'fallback'
          };
        }
      }
    }
    
    const activeProvider = providers.find(p => p.apiKey && p.models && p.models.length > 0);
    if (activeProvider) {
      const firstModel = activeProvider.models.find(m => m.selected) || activeProvider.models[0];
      if (firstModel) {
        return {
          providerId: activeProvider.id,
          modelId: firstModel.id,
          provider: activeProvider,
          source: 'system-default'
        };
      }
    }
    
    logger.error('ConfigStore', `[getEffectiveModel] Failed to find ${purpose} model`);
    return null;
  }
}));