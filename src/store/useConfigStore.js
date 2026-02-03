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
  { id: 'aliyun', name: 'Aliyun (Qwen)', baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1', apiKey: '', enabled: false, models: [], format: 'openai' },
  { id: 'chatglm', name: 'ChatGLM', baseUrl: 'https://open.bigmodel.cn/api/paas/v4', apiKey: '', enabled: false, models: [], format: 'openai' },
  { id: 'volcengine', name: 'VolcEngine', baseUrl: 'https://ark.cn-beijing.volces.com/api/v3', apiKey: '', enabled: false, models: [], format: 'openai' },
  { id: 'azure', name: 'Azure OpenAI', baseUrl: '', apiKey: '', enabled: false, models: [], format: 'openai' },
  { id: 'lmstudio', name: 'LM Studio', baseUrl: 'http://localhost:1234/v1', apiKey: '', enabled: false, models: [], format: 'openai' },
];

/**
 * 配置项 Store
 * 维护 AI 提供商、模型选择、通用偏好、代理及云同步等全局设置
 */
export const useConfigStore = create((set, get) => ({
  // AI 服务提供商配置
  providers: DEFAULT_PROVIDERS,
  
  // 各业务场景的默认模型绑定
  defaultModels: {
    chat: '',
    naming: '',
    search: '',
    compression: '',
    ocr: ''
  },
  
  // 通用偏好设置
  general: {
    language: 'zh-CN',
    theme: 'system',
    fontSize: 14,
    autoRender: true
  },
  
  // 网络代理配置
  proxy: {
    enabled: false, 
    url: '/api/proxy',        // 本地开发代理
    cloudUrl: '',             // 生产环境云端代理
    encryptKey: true,         // 是否加密传输 API Key
    timeout: 30
  },
  
  // 云端同步设置
  cloudSync: {
    enabled: false,
    lastSyncTime: 0,
    autoSync: true,
    apiUrl: '',               // 同步后端入口
    syncStatus: 'idle',       // 当前状态：idle | syncing | success | error
    lastError: null,
    syncProgress: {
      current: 0,
      total: 0,
      currentType: ''
    }
  },
  
  // 联网搜索配置
  searchSettings: {
    enabled: false,
    engine: 'bing',
    apiKey: '',
  },
  
  // 全局对话预设
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
   * 加载基础外观配置
   * 独立于主配置存储，允许在用户登录解锁前应用 UI 主题
   */
  loadTheme: async () => {
    try {
      const themeSetting = await db.settings.get('theme');
      if (themeSetting && themeSetting.value) {
        set((state) => ({
          general: { ...state.general, theme: themeSetting.value }
        }));
      }
      // 加载后立即应用主题
      get().applyTheme();
    } catch (e) {
      logger.error('ConfigStore', 'Failed to load theme', e);
      get().applyTheme();
    }
  },

  // 单独保存主题设置（未加密，用于登录前访问）
  saveTheme: async (theme) => {
    try {
      await db.settings.put({ key: 'theme', value: theme });
    } catch (e) {
      logger.error('ConfigStore', 'Failed to save theme', e);
    }
  },

  /**
   * 加载完整的持久化加密配置
   * 依赖用户主密码进行解密
   * @param {string} password 解密用的主密码
   */
  loadConfig: async (password) => {
    const encrypted = await db.settings.get('config');
    if (encrypted) {
      try {
        const config = await decryptData(encrypted.value, password);
        // 与默认提供商合并，确保新提供商显示
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
        
        // 同步语言设置到i18n store
        if (config.general?.language) {
          useI18nStore.getState().setLanguage(config.general.language);
        }
      } catch (e) {
        logger.error('ConfigStore', 'Failed to decrypt config', e);
      }
    }
  },

  // 保存加密配置
  saveConfig: async (password) => {
    const { providers, defaultModels, general, proxy, searchSettings, conversationPresets, conversationSettings, cloudSync } = get();
    const config = { providers, defaultModels, general, proxy, searchSettings, conversationPresets, conversationSettings, cloudSync };
    const encrypted = await encryptData(config, password);
    await db.settings.put({ key: 'config', value: encrypted });
    // 同时单独保存主题供登录前访问
    await get().saveTheme(general.theme);
  },

  // 添加自定义提供商
  addCustomProvider: (provider) => set((state) => ({
    providers: [...state.providers, { ...provider, id: `custom-${Date.now()}`, enabled: true, models: [], format: provider.format || 'openai' }]
  })),

  // 切换模型选中状态
  toggleModelSelection: (providerId, modelId) => set((state) => {
    const providers = state.providers.map(p => {
      if (p.id === providerId) {
        const models = p.models.map(m => {
          if (m.id === modelId) {
            // 确保布尔值切换：false/undefined -> true，true -> false
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

  // 更新模型能力配置
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

  // 更新模型信息
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

  // 添加自定义模型
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

  // 删除模型
  deleteModel: (providerId, modelId) => set((state) => {
    const providers = state.providers.map(p => {
      if (p.id === providerId) {
        return { ...p, models: p.models.filter(m => m.id !== modelId) };
      }
      return p;
    });
    return { providers };
  }),

  // 移除提供商（默认提供商不可删除）
  removeProvider: (id) => set((state) => ({
    providers: state.providers.filter(p => p.id !== id || DEFAULT_PROVIDERS.find(dp => dp.id === id))
  })),

  // 更新提供商信息
  updateProvider: (id, updates) => set((state) => ({
    providers: state.providers.map(p => p.id === id ? { ...p, ...updates } : p)
  })),

  // 更新代理配置
  updateProxy: (updates) => {
    set((state) => ({
      proxy: { ...state.proxy, ...updates }
    }));
  },
  
  // 更新云同步配置
  updateCloudSync: async (updates) => {
    // 如果尝试启用云同步
    if (updates.enabled === true) {
      // 动态导入避免循环依赖
      const { syncService } = await import('../services/syncService');
      
      // 检查同步服务是否可用 (非阻塞)
      syncService.checkProxyHealth().then(isAvailable => {
        if (!isAvailable) {
          logger.warn('ConfigStore', 'Cloud sync enabled but sync server is not currently available');
        }
      });
      
      // 启动健康监控
      syncService.startProxyHealthMonitoring();
    } else if (updates.enabled === false) {
      // 停止健康监控
      import('../services/syncService').then(({ syncService }) => {
        syncService.stopProxyHealthMonitoring();
      });
    }
    
    set((state) => ({
      cloudSync: { ...state.cloudSync, ...updates }
    }));
  },

  // 更新通用设置
  updateGeneral: (updates) => {
    set((state) => ({
      general: { ...state.general, ...updates }
    }));
    // 确保UI一致性，立即应用主题
    get().applyTheme();
    
    if (updates.theme) {
      // 单独保存主题供登录前访问
      get().saveTheme(updates.theme);
    }
    
    // 如果更新了语言设置，同步到i18n store
    if (updates.language) {
      useI18nStore.getState().setLanguage(updates.language);
    }
  },

  // 更新默认模型配置
  updateDefaultModels: (updates) => set((state) => ({
    defaultModels: { ...state.defaultModels, ...updates }
  })),

  // 更新搜索设置
  updateSearchSettings: (updates) => set((state) => ({
    searchSettings: { ...state.searchSettings, ...updates }
  })),

  // 更新对话预设
  updateConversationPresets: (updates) => set((state) => ({
    conversationPresets: { ...state.conversationPresets, ...updates }
  })),

  // 重置对话预设为默认值
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

  // 更新对话设置
  updateConversationSettings: (updates) => set((state) => ({
    conversationSettings: { 
      ...state.conversationSettings,
      display: { ...state.conversationSettings.display, ...(updates.display || {}) },
      features: { ...state.conversationSettings.features, ...(updates.features || {}) },
      compression: { ...state.conversationSettings.compression, ...(updates.compression || {}) }
    }
  })),

  // 应用主题：根据设置切换明暗模式
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
      
      // 监听系统主题变化
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
   * 智能模型决策引擎
   * 根据业务目的（purpose）自动匹配最优可用模型
   * 优先级：场景绑定默认模型 > 当前对话指定模型 > 系统首个可用模型
   */
  getEffectiveModel: (purpose, currentModel = null) => {
    const { defaultModels, providers } = get();
    
    // 支持的目的：chat、naming、search、ocr
    const configuredModelId = defaultModels[purpose];
    
    // 第一优先级：使用配置的默认模型
    if (configuredModelId && configuredModelId !== 'null' && configuredModelId !== '') {
      // 查找模型所属的提供商
      for (const provider of providers) {
        if (provider.apiKey && provider.models) {
          const model = provider.models.find(m => m.id === configuredModelId);
          if (model) {
            logger.info('ConfigStore', `[getEffectiveModel] Using configured ${purpose} model:`, configuredModelId);
            return {
              providerId: provider.id,
              modelId: configuredModelId,
              provider,
              source: 'configured'
            };
          }
        }
      }
      // 只在chat和OCR目的时显示警告，避免naming和search时频繁警告
      if (purpose === 'chat' || purpose === 'ocr') {
        logger.warn('ConfigStore', `[getEffectiveModel] Configured ${purpose} model unavailable:`, configuredModelId);
      }
    }
    
    // 第二优先级：使用当前对话模型
    if (currentModel && currentModel.providerId && currentModel.modelId) {
      const provider = providers.find(p => p.id === currentModel.providerId);
      if (provider && provider.apiKey) {
        const model = provider.models?.find(m => m.id === currentModel.modelId);
        if (model) {
          logger.info('ConfigStore', `[getEffectiveModel] ${purpose} model not configured, using fallback:`, currentModel.modelId);
          return {
            providerId: currentModel.providerId,
            modelId: currentModel.modelId,
            provider,
            source: 'fallback'
          };
        }
      }
    }
    
    // 第三优先级：使用第一个可用的模型
    const activeProvider = providers.find(p => p.apiKey && p.models && p.models.length > 0);
    if (activeProvider) {
      const firstModel = activeProvider.models.find(m => m.selected) || activeProvider.models[0];
      if (firstModel) {
        logger.info('ConfigStore', `[getEffectiveModel] ${purpose} model using system default:`, firstModel.id);
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
