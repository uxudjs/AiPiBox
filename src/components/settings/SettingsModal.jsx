import React, { useState, useEffect, useRef } from 'react';
import { X, Cpu, Settings as SettingsIcon, Shield, Globe, Search, MessageSquare, ChevronRight, ChevronDown, Check, Save, Trash2, Plus, RefreshCw, AlertCircle, Brain, Camera, Sparkles, Edit2, Info, RotateCcw, BookOpen, Activity, Clock, LogOut, Image as ImageIcon, HelpCircle } from 'lucide-react';
import { cn } from '../../utils/cn';
import KnowledgeBaseSettings from './KnowledgeBaseSettings';
import SystemLogs from './SystemLogs';
import VirtualList from '../ui/VirtualList';
import ModelSelector from './ModelSelector';
import SyncStatusIndicator from '../sync/SyncStatusIndicator';
import HelpGuide from './HelpGuide';
import { useTranslation } from '../../i18n';

/**
 * 视觉识别：厂商颜色方案
 * 为模型选择与提供商列表提供一致的色彩提示
 */
const PROVIDER_BRAND_COLORS = {
  'openai': { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', ring: 'ring-emerald-500/20' },
  'anthropic': { bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', ring: 'ring-purple-500/20' },
  'google': { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', ring: 'ring-blue-500/20' },
  'gemini': { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', ring: 'ring-blue-500/20' },
  'ollama': { bg: 'bg-slate-500/10', text: 'text-slate-600 dark:text-slate-400', ring: 'ring-slate-500/20' },
  'deepseek': { bg: 'bg-cyan-500/10', text: 'text-cyan-600 dark:text-cyan-400', ring: 'ring-cyan-500/20' },
  'siliconflow': { bg: 'bg-indigo-500/10', text: 'text-indigo-600 dark:text-indigo-400', ring: 'ring-indigo-500/20' },
  'openrouter': { bg: 'bg-violet-500/10', text: 'text-violet-600 dark:text-violet-400', ring: 'ring-violet-500/20' },
  'mistral': { bg: 'bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400', ring: 'ring-orange-500/20' },
  'groq': { bg: 'bg-yellow-500/10', text: 'text-yellow-600 dark:text-yellow-500', ring: 'ring-yellow-500/20' },
  'perplexity': { bg: 'bg-teal-500/10', text: 'text-teal-600 dark:text-teal-400', ring: 'ring-teal-500/20' },
  'xai': { bg: 'bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400', ring: 'ring-rose-500/20' },
  'aliyun': { bg: 'bg-blue-600/10', text: 'text-blue-700 dark:text-blue-400', ring: 'ring-blue-600/20' },
  'chatglm': { bg: 'bg-green-500/10', text: 'text-green-600 dark:text-green-400', ring: 'ring-green-500/20' },
  'volcengine': { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400', ring: 'ring-red-500/20' },
  'azure': { bg: 'bg-sky-500/10', text: 'text-sky-600 dark:text-sky-400', ring: 'ring-sky-500/20' },
  'lmstudio': { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', ring: 'ring-amber-500/20' },
};

// 获取提供商品牌颜色
const getProviderColors = (providerId) => {
  const id = String(providerId).toLowerCase();
  return PROVIDER_BRAND_COLORS[id] || { 
    bg: 'bg-accent', 
    text: 'text-muted-foreground',
    ring: 'ring-border'
  };
};

import { useConfigStore } from '../../store/useConfigStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useChatStore } from '../../store/useChatStore';
import { clearAllData } from '../../db';
import { syncService } from '../../services/syncService';
import { testConnection, fetchModels } from '../../services/aiService';
import { encryptData, decryptData } from '../../utils/crypto';
import { logger } from '../../services/logger';
import { inferModelDisplayName } from '../../utils/modelNameInference';
import { getProxyApiUrl, getSyncApiUrl } from '../../utils/envDetect';

import { useKnowledgeBaseStore } from '../../store/useKnowledgeBaseStore';

/**
 * 全局设置中心
 * 核心功能：管理多厂商 API 配置、默认模型绑定、云同步偏好及系统维护工具
 */
const SettingsModal = ({ isOpen, onClose, initialTab = 'llm' }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [editingProvider, setEditingProvider] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [modelSearchQuery, setModelSearchQuery] = useState('');
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [editingModel, setEditingModel] = useState(null);
  const [isTestingSync, setIsTestingSync] = useState(false);
  const [proxyStatus, setProxyStatus] = useState(() => {
    // 初始化时检查环境
    try {
      const { detectPlatform, Platform } = require('../../utils/envDetect');
      const platform = detectPlatform();
      // 生产环境默认代理可用
      if (platform !== Platform.LOCAL && platform !== Platform.UNKNOWN) {
        return { isAvailable: true, lastCheckTime: Date.now(), errorCount: 0 };
      }
    } catch (error) {
      // 忽略错误
    }
    return { isAvailable: false, lastCheckTime: 0, errorCount: 0 };
  });
  const [cloudSyncError, setCloudSyncError] = useState(null);
  
  // 本地暂存配置，直到点击保存才同步到 Store
  const [localConfig, setLocalConfig] = useState(null);

  const { 
    providers: storeProviders, 
    proxy: storeProxy, 
    general: storeGeneral, 
    defaultModels: storeDefaultModels, 
    searchSettings: storeSearchSettings, 
    conversationPresets: storeConversationPresets,
    conversationSettings: storeConversationSettings,
    cloudSync: storeCloudSync,
    updateProvider, 
    updateProxy, 
    updateGeneral, 
    updateDefaultModels, 
    saveConfig, 
    addCustomProvider, 
    removeProvider, 
    updateSearchSettings,
    updateCloudSync,
    updateConversationPresets,
    updateConversationSettings,
    resetConversationPresets,
    toggleModelSelection,
    updateModelCapability,
    updateModelInfo,
    addCustomModel,
    deleteModel
  } = useConfigStore();
  const { retrievalSettings: storeRetrievalSettings, updateRetrievalSettings } = useKnowledgeBaseStore();
  const { sessionPassword, logout, persistenceMode, setPersistence } = useAuthStore();

  // 初始化本地配置
  useEffect(() => {
    if (isOpen) {
      setLocalConfig({
        providers: JSON.parse(JSON.stringify(storeProviders)),
        proxy: { ...storeProxy },
        general: { ...storeGeneral },
        defaultModels: { ...storeDefaultModels },
        searchSettings: { ...storeSearchSettings },
        conversationPresets: { ...storeConversationPresets },
        conversationSettings: JSON.parse(JSON.stringify(storeConversationSettings)),
        cloudSync: { ...storeCloudSync },
        retrievalSettings: { ...storeRetrievalSettings }
      });
    } else {
      setLocalConfig(null);
      setEditingProvider(null);
    }
  }, [isOpen]);

  // 数字输入框格式化辅助函数
  const formatNumberWithCommas = (num) => {
    if (!num && num !== 0) return '';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };
  
  const parseFormattedNumber = (str) => {
    if (!str) return undefined;
    const cleanedStr = str.replace(/,/g, '');
    const num = parseInt(cleanedStr, 10);
    return isNaN(num) || num < 0 ? undefined : num;
  };
  
  // 通用设置下拉框状态
  const [openGeneralDropdown, setOpenGeneralDropdown] = useState(null);
  const [openSearchDropdown, setOpenSearchDropdown] = useState(false);
  
  // 下拉列表滚动容器的 ref
  const searchDropdownScrollRef = useRef(null);
  const generalDropdownScrollRef = useRef(null);

  const [tempApiKey, setTempApiKey] = useState('');

  useEffect(() => {
    if (editingProvider) {
      setTempApiKey(editingProvider.apiKey || '');
      setTestResult(null);
    }
  }, [editingProvider]);
  
  // 当initialTab变化时更新activeTab
  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);
  
  // 定时更新代理状态
  useEffect(() => {
    if (isOpen && localConfig?.cloudSync?.enabled && localConfig?.proxy?.enabled) {
      const updateProxyStatus = async () => {
        // 主动触发健康检查
        await syncService.checkProxyHealth();
        // 更新UI状态
        setProxyStatus(syncService.getProxyStatus());
      };
      
      // 立即执行一次检查
      updateProxyStatus();
      // 每30秒检查一次（降低频率减少负载）
      const interval = setInterval(updateProxyStatus, 30000);
      
      return () => clearInterval(interval);
    } else if (isOpen) {
      // 如果代理或云同步未启用，直接获取状态（不进行实际检查）
      setProxyStatus(syncService.getProxyStatus());
    }
  }, [isOpen, localConfig?.cloudSync?.enabled, localConfig?.proxy?.enabled]);
  
  /**
   * 滚动焦点锁定：下拉列表增强
   * 当自定义下拉菜单（如引擎选择、语言切换）开启时，拦截全局滚轮事件，确保列表内滚动不引发背景页滚动
   */
  useEffect(() => {
    const handleWheel = (e) => {
      let targetScrollContainer = null;
      
      // 确定当前打开的下拉框滚动容器
      if (openSearchDropdown && searchDropdownScrollRef.current) {
        targetScrollContainer = searchDropdownScrollRef.current;
      } else if (openGeneralDropdown && generalDropdownScrollRef.current) {
        targetScrollContainer = generalDropdownScrollRef.current;
      }
      
      if (!targetScrollContainer) return;
      
      // 检查鼠标是否在下拉框容器内
      const isMouseInDropdown = targetScrollContainer.contains(e.target);
      
      // 只有当鼠标在下拉框内时才处理
      if (isMouseInDropdown) {
        // 检查下拉框是否还能继续滚动
        const { scrollTop, scrollHeight, clientHeight } = targetScrollContainer;
        const isScrollingDown = e.deltaY > 0;
        const isScrollingUp = e.deltaY < 0;
        
        const canScrollDown = scrollTop < scrollHeight - clientHeight - 1; // -1 for rounding
        const canScrollUp = scrollTop > 1;
        
        // 如果下拉框还能滚动，阻止默认行为并滚动下拉框
        if ((isScrollingDown && canScrollDown) || (isScrollingUp && canScrollUp)) {
          e.preventDefault();
          targetScrollContainer.scrollTop += e.deltaY;
        }
        // 如果下拉框已经滚动到底/顶，不阻止，让事件冒泡到页面滚动
      }
      // 鼠标不在下拉框内：不做任何处理，让页面正常滚动
    };
    
    // 只在下拉框打开时添加监听器
    if (openSearchDropdown || openGeneralDropdown) {
      window.addEventListener('wheel', handleWheel, { passive: false });
      return () => window.removeEventListener('wheel', handleWheel);
    }
  }, [openSearchDropdown, openGeneralDropdown]);

  if (!isOpen || !localConfig) return null;

  const {
    providers,
    proxy,
    general,
    defaultModels,
    searchSettings,
    conversationPresets,
    conversationSettings,
    cloudSync,
    retrievalSettings
  } = localConfig;

  // 更新本地配置的辅助函数
  const updateLocalConfig = (section, updates) => {
    setLocalConfig(prev => {
      if (!prev) return prev;
      if (section === 'providers') {
        // 特殊处理 providers
        return { ...prev, providers: updates };
      }
      return {
        ...prev,
        [section]: { ...prev[section], ...updates }
      };
    });
  };

  // 测试提供商连接
  const handleTestConnection = async () => {
    if (!editingProvider) return;
    setIsTesting(true);
    setTestResult(null);
    try {
      const ok = await testConnection(editingProvider.id, editingProvider.apiKey, editingProvider.baseUrl, proxy, editingProvider.format || 'openai');
      setTestResult({ success: ok, message: ok ? t('settings.llm.connectionSuccess') : t('settings.llm.connectionFailed') });
    } catch (e) {
      setTestResult({ success: false, message: `${t('error.apiError')}: ${e.message}` });
    } finally {
      setIsTesting(false);
    }
  };

  // 获取提供商模型列表
  const handleFetchModels = async () => {
    if (!editingProvider) return;
    setIsFetching(true);
    setTestResult(null);
    
    try {
      const models = await fetchModels(
        editingProvider.id, 
        editingProvider.apiKey, 
        editingProvider.baseUrl, 
        proxy, 
        editingProvider.format || 'openai'
      );
      
      // 验证模型数据格式
      if (!Array.isArray(models)) {
        throw new Error(t('error.invalidResponse'));
      }
      
      // 检查模型数量是否过多（超过500个）
      if (models.length > 500) {
        const confirmed = confirm(
          t('settings.llm.fetchLargeConfirm', { count: models.length }) || `检测到 ${models.length} 个模型，数量过多可能导致界面卡顿。建议在设置中只勾选常用模型。是否继续加载所有模型？`
        );
        if (!confirmed) {
          setIsFetching(false);
          return;
        }
      }
      
      // Ensure all models have required fields
      // Note: The 'name' field already contains the display name with this priority:
      // 1. API-provided displayName (if available from fetchModels)
      // 2. Local inference from model ID (fallback from fetchModels)
      const validatedModels = models.map(m => ({
        id: String(m.id || 'unknown'),
        name: String(m.name || m.id || 'Unknown Model'), // name already prioritized by fetchModels
        selected: m.selected === true,  // Default to false if not explicitly true
        capabilities: {
          thinking: m.capabilities?.thinking || false,
          multimodal: m.capabilities?.multimodal || false,
          tools: m.capabilities?.tools || false
        }
      }));
      
      // Update local config instead of store
      const updatedProviders = providers.map(p => 
        p.id === editingProvider.id ? { ...p, models: validatedModels } : p
      );
      updateLocalConfig('providers', updatedProviders);
      
      // Then update local editing state
      setEditingProvider(prev => ({
        ...prev,
        models: validatedModels
      }));
      
      setTestResult({ 
        success: true, 
        message: t('settings.llm.fetchSuccess', { count: validatedModels.length }) 
      });
      
    } catch (e) {
      const errorMsg = e.message || t('common.unknown');
      logger.error('SettingsModal', 'Fetch models error:', e);
      
      setTestResult({ 
        success: false, 
        message: t('settings.llm.fetchFailed', { error: errorMsg }) 
      });
    } finally {
      setIsFetching(false);
    }
  };



  // Render custom dropdown for search engine selection
  const renderSearchEngineSelector = () => {
    const engines = [
      { value: 'bing', label: 'Bing Search', icon: Globe },
      { value: 'google', label: 'Google Custom Search', icon: Globe },
      { value: 'tavily', label: 'Tavily AI (' + t('common.recommend') + ')', icon: Search }
    ];
    
    const currentEngine = engines.find(e => e.value === searchSettings.engine) || engines[0];
    
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpenSearchDropdown(!openSearchDropdown)}
          className="w-full px-4 py-3 bg-accent rounded-xl border-none focus:ring-2 focus:ring-primary text-sm flex items-center justify-between hover:bg-accent/80 transition-colors"
        >
          <span className="truncate">{currentEngine.label}</span>
          <ChevronDown className={cn("w-4 h-4 opacity-50 transition-transform duration-300 flex-shrink-0 ml-2", openSearchDropdown && "rotate-180")} />
        </button>

        {openSearchDropdown && (
          <>
            <div 
              className="fixed inset-0 z-[80]" 
              onClick={() => setOpenSearchDropdown(false)}
              onWheel={(e) => e.stopPropagation()}
            />
            <div className="absolute top-full left-0 mt-2 w-full bg-card border rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[100]">
              <div className="p-2 border-b flex items-center justify-center bg-accent/20">
                <span className="text-xs font-black text-primary uppercase tracking-widest">{t('settings.search.selectEngine')}</span>
              </div>
            <div ref={searchDropdownScrollRef} className="max-h-[min(400px,calc(100vh-300px))] overflow-y-auto p-2 custom-scrollbar space-y-1">
              {engines.map(engine => {
                const isSelected = searchSettings.engine === engine.value;
                const EngineIcon = engine.icon;
                
                return (
                  <button
                    key={engine.value}
                    type="button"
                    onClick={() => {
                      updateLocalConfig('searchSettings', { engine: engine.value });
                      setOpenSearchDropdown(false);
                    }}
                    className={cn(
                      "w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between group/item border border-transparent",
                      isSelected 
                        ? "bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20" 
                        : "hover:bg-primary/5 hover:border-primary/20"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <EngineIcon className="w-4 h-4" />
                      <span className="text-xs truncate">{engine.label}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>
            </div>
          </>
        )}
      </div>
    );
  };

  // Render custom dropdown for general settings (language, theme, etc.)
  const renderGeneralSelector = (options, currentValue, onChange, label) => {
    const currentOption = options.find(o => o.value === currentValue) || options[0];
    const isOpen = openGeneralDropdown === label;
    
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpenGeneralDropdown(isOpen ? null : label)}
          className="w-full px-4 py-3 bg-accent rounded-xl border-none focus:ring-2 focus:ring-primary text-sm flex items-center justify-between hover:bg-accent/80 transition-colors"
        >
          <span className="truncate">{currentOption.label}</span>
          <ChevronDown className={cn("w-4 h-4 opacity-50 transition-transform duration-300 flex-shrink-0 ml-2", isOpen && "rotate-180")} />
        </button>

        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-[80]" 
              onClick={() => setOpenGeneralDropdown(null)}
              onWheel={(e) => e.stopPropagation()}
            />
            <div className="absolute top-full left-0 mt-2 w-full bg-card border rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[100]">
              <div className="p-2 border-b flex items-center justify-center bg-accent/20">
                <span className="text-xs font-black text-primary uppercase tracking-widest">{label}</span>
              </div>
            <div ref={generalDropdownScrollRef} className="max-h-[min(400px,calc(100vh-300px))] overflow-y-auto p-2 custom-scrollbar space-y-1">
              {options.map(option => {
                const isSelected = currentValue === option.value;
                
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setOpenGeneralDropdown(null);
                    }}
                    className={cn(
                      "w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between group/item border border-transparent",
                      isSelected 
                        ? "bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20" 
                        : "hover:bg-primary/5 hover:border-primary/20"
                    )}
                  >
                    <span className="text-xs truncate">{option.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>
            </div>
          </>
        )}
      </div>
    );
  };

  /**
   * 变更持久化：配置批量保存
   * 将本地 UI 的暂存状态同步至各核心 Store 并触发加密持久化存储
   */
  const applyAllChanges = async () => {
    try {
      // 逐个更新 store 状态
      providers.forEach(p => updateProvider(p.id, p));
      updateProxy(proxy);
      updateGeneral(general);
      updateDefaultModels(defaultModels);
      updateSearchSettings(searchSettings);
      updateConversationPresets(conversationPresets);
      updateConversationSettings(conversationSettings);
      
      // 处理可能失败的更新
      try {
        await updateCloudSync(cloudSync);
      } catch (err) {
        logger.error('SettingsModal', 'Failed to update cloud sync', err);
      }
      
      updateRetrievalSettings(retrievalSettings);
      
      // 更新持久化设置
      if (localConfig.persistenceMode) {
        setPersistence(localConfig.persistenceMode);
      }

      // 持久化配置
      await saveConfig(sessionPassword);
      return true;
    } catch (err) {
      logger.error('SettingsModal', 'Failed to apply changes', err);
      alert(t('error.saveFailed') || '保存失败');
      return false;
    }
  };

  const handleApply = async () => {
    const success = await applyAllChanges();
    if (success) onClose();
  };

  const handleSaveOnly = async () => {
    const success = await applyAllChanges();
    if (success) {
        alert(t('common.saveSuccess') || '保存成功');
    }
  };

  const handleSignOut = () => {
    if (confirm(t('settings.security.signOutConfirm'))) {
      logout();
      window.location.reload();
    }
  };

  const handleClearData = async () => {
    if (confirm(t('settings.security.clearDataConfirm'))) {
      try {
        // Clear cloud data if possible before logging out
        await syncService.deleteCloudData();
      } catch (err) {
        logger.error('SettingsModal', 'Failed to clear cloud data', err);
        if (!confirm(t('settings.security.clearCloudDataFailedConfirm') || '无法清除云端数据，是否仍要清除本地数据并退出？')) {
          return;
        }
      }
      await clearAllData();
      logout();
      window.location.reload();
    }
  };

  const handleExportBackup = async () => {
    const password = prompt(t('settings.security.exportPassword'));
    if (!password) return;
    
    try {
      // 使用syncService的完整备份功能
      const blob = await syncService.exportFullBackup(password, {
        includeSystemLogs: false, // 默认不包含系统日志(减小文件大小)
        includePublished: true     // 包含已发布的代码
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aipibox-backup-${new Date().toISOString().split('T')[0]}.aipibox`;
      a.click();
      URL.revokeObjectURL(url);
      
      // 显示成功消息
      const fileSize = (blob.size / 1024 / 1024).toFixed(2);
      alert(t('settings.security.exportSuccess', { size: fileSize }));
    } catch (e) {
      alert(t('settings.security.exportFailed', { error: e.message }));
    }
  };

  // 手动同步到云端
  const handleManualSync = async () => {
    const { sessionPassword } = useAuthStore.getState();
    if (!sessionPassword) {
      alert(t('auth.pleaseLogin'));
      return;
    }

    // 同步前自动保存当前 UI 配置，确保使用的是最新 URL
    const saved = await applyAllChanges();
    if (!saved) return;

    try {
      await syncService.syncWithConflictResolution(sessionPassword);
      alert(t('settings.security.syncSuccess'));
    } catch (error) {
      alert(t('settings.security.syncFailed', { error: error.message }));
    }
  };

  const handleImportBackup = async () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.aipibox';
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const password = prompt(t('settings.security.importPassword'));
      if (!password) return;

      try {
        // 使用syncService的完整恢复功能
        const result = await syncService.importFullBackup(file, password);
        
        if (result.success) {
          // 显示成功消息和统计信息
          const stats = result.stats;
          const message = t('settings.security.importSuccess') + '\n\n' +
            `${t('settings.security.conversations')}: ${stats.conversations}\n` +
            `${t('settings.security.messages')}: ${stats.messages}\n` +
            `${t('settings.security.images')}: ${stats.images}\n` +
            `${t('settings.security.knowledgeBases')}: ${stats.knowledgeBases}\n\n` +
            t('settings.security.reloadPrompt');
          
          alert(message);
          
          // 关闭设置界面并重载页面
          onClose();
          setTimeout(() => window.location.reload(), 500);
        }
      } catch (err) {
        alert(t('settings.security.importFailed', { error: err.message }));
      }
    };
    fileInput.click();
  };

  const tabs = [
    { id: 'llm', label: t('settings.tabs.llm'), icon: Cpu },
    { id: 'presets', label: t('settings.tabs.presets'), icon: MessageSquare },
    { id: 'conversation', label: t('settings.tabs.conversation'), icon: MessageSquare },
    { id: 'search', label: t('settings.tabs.search'), icon: Search },
    { id: 'knowledge-base', label: t('settings.tabs.knowledgeBase'), icon: BookOpen },
    { id: 'general', label: t('settings.tabs.general'), icon: SettingsIcon },
    { id: 'security', label: t('settings.tabs.security'), icon: Shield },
    { id: 'proxy', label: t('settings.tabs.proxy'), icon: Globe },
    { id: 'logs', label: t('settings.tabs.logs'), icon: Activity },
    { id: 'help', label: t('settings.tabs.help'), icon: HelpCircle },
  ];

  if (!localConfig) return null;

  return (
    <div className="fixed inset-0 z-[10002] flex items-center justify-center bg-black/50 backdrop-blur-sm p-0 md:p-4">
      <div className="bg-background w-full h-full md:max-w-4xl md:h-[85vh] md:rounded-2xl shadow-2xl flex flex-col overflow-hidden border">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-2 flex-1">
            {editingProvider && (
              <button onClick={() => setEditingProvider(null)} className="p-1 hover:bg-accent rounded-md md:hidden">
                <ChevronRight className="w-5 h-5 rotate-180" />
              </button>
            )}
            <h2 className="text-xl font-bold">
              {editingProvider ? editingProvider.name : tabs.find(t_ => t_.id === activeTab)?.label || t('settings.title')}
            </h2>
            
            {/* 日志搜索框 */}
            {activeTab === 'logs' && !editingProvider && (
              <div className="flex-1 flex justify-end ml-4">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('settings.logs.searchPlaceholder')}
                    value={logSearchQuery}
                    onChange={(e) => setLogSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-sm bg-accent rounded-md focus:ring-1 focus:ring-primary outline-none border-none"
                  />
                </div>
              </div>
            )}
          </div>
          
          <button onClick={onClose} className="p-2 hover:bg-accent rounded-full transition-colors ml-4">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className={cn(
            "w-16 md:w-64 border-r bg-accent/20 flex flex-col py-4 overflow-y-auto custom-scrollbar",
            editingProvider && "hidden md:flex"
          )}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                    setActiveTab(tab.id);
                    setEditingProvider(null);
                }}
                className={cn(
                  "flex items-center gap-3 px-4 md:px-6 py-3 text-sm transition-colors relative",
                  activeTab === tab.id 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-accent/50"
                )}
              >
                <tab.icon className="w-5 h-5 flex-shrink-0" />
                <span className="hidden md:inline">{tab.label}</span>
                {activeTab === tab.id && <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary" />}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className={cn(
            "flex-1 overflow-y-auto custom-scrollbar bg-card/30",
            activeTab === 'logs' ? "p-0 overflow-hidden" : "p-6 md:p-8 space-y-8"
          )}>
            {activeTab === 'llm' && !editingProvider && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{t('settings.llm.title')}</h3>
                  <button 
                    onClick={() => {
                      const newProvider = { id: `custom-${Date.now()}`, name: t('inputArea.unnamedProvider'), baseUrl: '', apiKey: '', enabled: true, models: [], format: 'openai' };
                      updateLocalConfig('providers', [...providers, newProvider]);
                    }}
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <Plus className="w-3 h-3" /> {t('settings.llm.addCustom')}
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {providers.map(p => (
                    <div key={p.id} className="relative group">
                      <button
                        onClick={() => setEditingProvider(p)}
                        className={cn(
                          "w-full flex items-center justify-between p-4 rounded-xl border bg-card hover:border-primary/50 transition-all hover:shadow-md text-left",
                          p.apiKey && "border-primary/30"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold",
                              p.apiKey ? getProviderColors(p.id).bg : "bg-accent",
                              p.apiKey ? getProviderColors(p.id).text : "text-muted-foreground"
                          )}>
                            {String(p.name || '?').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-sm">{p.name}</div>
                            <div className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                              {p.apiKey ? t('settings.llm.modelsCount', { count: p.models?.length || 0 }) : t('settings.llm.notConfigured')}
                            </div>
                          </div>
                        </div>
                        {p.apiKey && <Check className="w-4 h-4 text-green-500" />}
                      </button>
                      {p.id.startsWith('custom-') && (
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            updateLocalConfig('providers', providers.filter(pr => pr.id !== p.id));
                          }}
                          className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'llm' && editingProvider && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <div className="flex items-center justify-between border-b pb-4">
                   <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl",
                        getProviderColors(editingProvider.id).bg,
                        getProviderColors(editingProvider.id).text
                      )}>
                        {String(editingProvider.name || '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <input 
                            type="text" 
                            value={editingProvider.name}
                            onChange={(e) => {
                              const name = e.target.value;
                              const updatedProviders = providers.map(p => p.id === editingProvider.id ? { ...p, name } : p);
                              updateLocalConfig('providers', updatedProviders);
                              setEditingProvider(prev => ({ ...prev, name }));
                            }}
                            className="font-bold bg-transparent border-none focus:ring-0 p-0 w-32"
                          />
                          <h3 className="font-bold">{t('settings.llm.configuration')}</h3>
                        </div>
                        <p className="text-xs text-muted-foreground">{t('settings.llm.customConfigHint')}</p>
                      </div>
                   </div>
                   <button 
                    onClick={() => setEditingProvider(null)}
                    className="text-sm text-primary hover:underline"
                   >
                    {t('settings.llm.backToList')}
                   </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('settings.llm.apiKey')}</label>
                    <input 
                      type="password" 
                      value={tempApiKey}
                      onChange={(e) => {
                        const apiKey = e.target.value;
                        setTempApiKey(apiKey);
                        const updatedProviders = providers.map(p => p.id === editingProvider.id ? { ...p, apiKey } : p);
                        updateLocalConfig('providers', updatedProviders);
                        setEditingProvider(prev => ({ ...prev, apiKey }));
                      }}
                      className="w-full px-4 py-3 bg-accent rounded-xl border-none focus:ring-2 focus:ring-primary font-mono text-sm"
                      placeholder="sk-..."
                    />
                  </div>

                  {editingProvider.id.startsWith('custom-') && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t('settings.llm.apiFormat')}</label>
                      <select 
                        value={editingProvider.format || 'openai'}
                        onChange={(e) => {
                          const format = e.target.value;
                          const updatedProviders = providers.map(p => p.id === editingProvider.id ? { ...p, format } : p);
                          updateLocalConfig('providers', updatedProviders);
                          setEditingProvider(prev => ({ ...prev, format }));
                        }}
                        className="w-full px-4 py-3 bg-accent rounded-xl border-none focus:ring-2 focus:ring-primary text-sm"
                      >
                        <option value="openai">OpenAI</option>
                        <option value="claude">Claude</option>
                        <option value="gemini">Google Gemini</option>
                      </select>
                    </div>
                  )}

                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t('settings.llm.apiEndpoint')}</label>
                    <input 
                      type="text" 
                      value={editingProvider.baseUrl}
                      onChange={(e) => {
                        const baseUrl = e.target.value;
                        const updatedProviders = providers.map(p => p.id === editingProvider.id ? { ...p, baseUrl } : p);
                        updateLocalConfig('providers', updatedProviders);
                        setEditingProvider(prev => ({ ...prev, baseUrl }));
                      }}
                      className="w-full px-4 py-3 bg-accent rounded-xl border-none focus:ring-2 focus:ring-primary text-sm"
                      placeholder="https://..."
                    />
                  </div>

                  <div className="pt-4 flex flex-col gap-3">
                    <div className="flex gap-3">
                      <button 
                        onClick={handleFetchModels}
                        disabled={isFetching || !tempApiKey}
                        className="flex-1 py-3 bg-primary/10 text-primary font-medium rounded-xl hover:bg-primary/20 transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isFetching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        {t('settings.llm.fetchModels')}
                      </button>
                      <button 
                        onClick={handleTestConnection}
                        disabled={isTesting || !tempApiKey}
                        className="flex-1 py-3 bg-accent font-medium rounded-xl hover:bg-accent/80 transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                        {t('settings.llm.testConnection')}
                      </button>
                    </div>
                    {testResult && (
                      <div className={cn(
                        "p-3 rounded-lg text-xs flex items-center gap-2",
                        testResult.success ? "bg-green-500/10 text-green-500" : "bg-destructive/10 text-destructive"
                      )}>
                        {testResult.success ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        {testResult.message}
                      </div>
                    )}
                  </div>

                  {editingProvider.models?.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">{t('settings.llm.modelManagement')} ({editingProvider.models.length})</label>
                        <div className="flex gap-2">
                          {editingProvider.models.length > 20 && (
                            <input
                              type="text"
                              placeholder={t('settings.llm.searchModel')}
                              value={modelSearchQuery}
                              onChange={(e) => setModelSearchQuery(e.target.value)}
                              className="px-3 py-1 text-xs bg-accent rounded-lg border-none focus:ring-1 focus:ring-primary"
                            />
                          )}
                          <button
                            onClick={() => setEditingModel({ 
                              providerId: editingProvider.id,
                              id: '',
                              name: '',
                              customId: '',
                              selected: false,
                              capabilities: { thinking: false, multimodal: false, tools: false },
                              isNew: true
                            })}
                            className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded-lg hover:opacity-90 flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> {t('settings.llm.newModel')}
                          </button>
                        </div>
                      </div>
                      <div className="border rounded-xl bg-accent/10">
                        {(() => {
                          const filteredModels = Array.isArray(editingProvider.models) 
                            ? editingProvider.models.filter(m => {
                                if (!m || !m.id) return false;
                                if (!modelSearchQuery) return true;
                                const query = modelSearchQuery.toLowerCase();
                                return String(m.name || '').toLowerCase().includes(query) ||
                                       String(m.id || '').toLowerCase().includes(query);
                              })
                            : [];
                          
                          if (filteredModels.length === 0) {
                            return (
                              <div className="p-8 text-center text-sm text-muted-foreground">
                                {modelSearchQuery ? t('sidebar.noMatches') : t('settings.presets.noModels')}
                              </div>
                            );
                          }
                          
                          // 使用虚拟滚动渲染大量模型（高性能）
                          return (
                            <VirtualList
                              items={filteredModels}
                              itemHeight={50}
                              containerHeight={256}
                              overscan={3}
                              className="p-1 custom-scrollbar"
                              renderItem={(m) => (
                                <div className="p-1.5 bg-card rounded-lg flex items-center justify-between group transition-all hover:bg-accent/50 h-full">
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <input 
                                      type="checkbox"
                                      checked={m.selected === true}
                                      onChange={() => {
                                        const updatedProviders = providers.map(p => 
                                          p.id === editingProvider.id 
                                            ? { 
                                                ...p, 
                                                models: p.models.map(model => 
                                                  model.id === m.id ? { ...model, selected: !model.selected } : model
                                                ) 
                                              } 
                                            : p
                                        );
                                        updateLocalConfig('providers', updatedProviders);

                                        setEditingProvider(prev => ({
                                          ...prev,
                                          models: prev.models.map(model => 
                                            model.id === m.id 
                                              ? { ...model, selected: !(model.selected === true) }
                                              : model
                                          )
                                        }));
                                      }}
                                      className="w-4 h-4 rounded border-primary text-primary flex-shrink-0"
                                    />
                                    <div className="flex flex-col min-w-0 flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold truncate">{m.name || m.id}</span>
                                      </div>
                                      <div className="flex gap-1.5 mt-0.5">
                                        <button 
                                          onClick={() => {
                                            const updatedProviders = providers.map(p => 
                                              p.id === editingProvider.id 
                                                ? { 
                                                    ...p, 
                                                    models: p.models.map(model => 
                                                      model.id === m.id ? { ...model, capabilities: { ...model.capabilities, thinking: !model.capabilities?.thinking } } : model
                                                    ) 
                                                  } 
                                                : p
                                            );
                                            updateLocalConfig('providers', updatedProviders);

                                            setEditingProvider(prev => ({
                                              ...prev,
                                              models: prev.models.map(model => 
                                                model.id === m.id 
                                                  ? { ...model, capabilities: { ...model.capabilities, thinking: !model.capabilities?.thinking } }
                                                  : model
                                              )
                                            }));
                                          }}
                                          className={cn("p-1 rounded transition-colors", m.capabilities?.thinking ? "text-orange-500 bg-orange-500/10" : "text-muted-foreground/20 bg-accent/30 grayscale")}
                                          title={t('model.capabilities.thinking')}
                                        >
                                          <Brain className="w-3 h-3" />
                                        </button>
                                        <button 
                                          onClick={() => {
                                            const updatedProviders = providers.map(p => 
                                              p.id === editingProvider.id 
                                                ? { 
                                                    ...p, 
                                                    models: p.models.map(model => 
                                                      model.id === m.id ? { ...model, capabilities: { ...model.capabilities, multimodal: !model.capabilities?.multimodal } } : model
                                                    ) 
                                                  } 
                                                : p
                                            );
                                            updateLocalConfig('providers', updatedProviders);

                                            setEditingProvider(prev => ({
                                              ...prev,
                                              models: prev.models.map(model => 
                                                model.id === m.id 
                                                  ? { ...model, capabilities: { ...model.capabilities, multimodal: !model.capabilities?.multimodal } }
                                                  : model
                                              )
                                            }));
                                          }}
                                          className={cn("p-1 rounded transition-colors", m.capabilities?.multimodal ? "text-purple-500 bg-purple-500/10" : "text-muted-foreground/20 bg-accent/30 grayscale")}
                                          title={t('model.capabilities.multimodal')}
                                        >
                                          <Camera className="w-3.5 h-3.5" />
                                        </button>
                                        <button 
                                          onClick={() => {
                                            const updatedProviders = providers.map(p => 
                                              p.id === editingProvider.id 
                                                ? { 
                                                    ...p, 
                                                    models: p.models.map(model => 
                                                      model.id === m.id ? { ...model, capabilities: { ...model.capabilities, imageGen: !model.capabilities?.imageGen } } : model
                                                    ) 
                                                  } 
                                                : p
                                            );
                                            updateLocalConfig('providers', updatedProviders);

                                            setEditingProvider(prev => ({
                                              ...prev,
                                              models: prev.models.map(model => 
                                                model.id === m.id 
                                                  ? { ...model, capabilities: { ...model.capabilities, imageGen: !model.capabilities?.imageGen } }
                                                  : model
                                              )
                                            }));
                                          }}
                                          className={cn("p-1 rounded transition-colors", m.capabilities?.imageGen ? "text-blue-500 bg-blue-500/10" : "text-muted-foreground/20 bg-accent/30 grayscale")}
                                          title={t('model.capabilities.imageGen')}
                                        >
                                          <ImageIcon className="w-3.5 h-3.5" />
                                        </button>
                                        <button 
                                          onClick={() => {
                                            const updatedProviders = providers.map(p => 
                                              p.id === editingProvider.id 
                                                ? { 
                                                    ...p, 
                                                    models: p.models.map(model => 
                                                      model.id === m.id ? { ...model, capabilities: { ...model.capabilities, tools: !model.capabilities?.tools } } : model
                                                    ) 
                                                  } 
                                                : p
                                            );
                                            updateLocalConfig('providers', updatedProviders);

                                            setEditingProvider(prev => ({
                                              ...prev,
                                              models: prev.models.map(model => 
                                                model.id === m.id 
                                                  ? { ...model, capabilities: { ...model.capabilities, tools: !model.capabilities?.tools } }
                                                  : model
                                              )
                                            }));
                                          }}
                                          className={cn("p-1 rounded transition-colors", m.capabilities?.tools ? "text-green-500 bg-green-500/10" : "text-muted-foreground/20 bg-accent/30 grayscale")}
                                          title={t('model.capabilities.tools')}
                                        >
                                          <Sparkles className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => setEditingModel({ 
                                        providerId: editingProvider.id,
                                        ...m,
                                        isNew: false
                                      })}
                                      className="p-1.5 hover:bg-primary/10 rounded transition-colors"
                                      title={t('common.edit')}
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (confirm(t('settings.llm.deleteModelConfirm', { name: m.name || m.id }))) {
                                          const updatedProviders = providers.map(p => 
                                            p.id === editingProvider.id 
                                              ? { ...p, models: p.models.filter(model => model.id !== m.id) } 
                                              : p
                                          );
                                          updateLocalConfig('providers', updatedProviders);

                                          setEditingProvider(prev => ({
                                            ...prev,
                                            models: prev.models.filter(model => model.id !== m.id)
                                          }));
                                        }
                                      }}
                                      className="p-1.5 hover:bg-destructive/10 text-destructive rounded transition-colors"
                                      title={t('common.delete')}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              )}
                            />
                          );
                        })()}
                      </div>
                      <p className="text-[10px] text-muted-foreground italic px-1">{t('settings.llm.selectToShow')}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'search' && (
              <div className="space-y-6 animate-in fade-in">
                <h3 className="text-lg font-semibold border-b pb-2">{t('settings.search.title')}</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl border bg-card">
                    <div>
                      <p className="font-medium text-sm">{t('settings.search.enableSearch')}</p>
                      <p className="text-xs text-muted-foreground">{t('settings.search.enableSearchHint')}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={searchSettings.enabled}
                        onChange={(e) => updateLocalConfig('searchSettings', { enabled: e.target.checked })}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-accent peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('settings.search.searchEngine')}</label>
                    {renderSearchEngineSelector()}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {searchSettings.engine === 'tavily' && 'Tavily API Key'}
                      {searchSettings.engine === 'bing' && 'Bing Search API Key'}
                      {searchSettings.engine === 'google' && 'Google API Key | CX'}
                    </label>
                    <input 
                      type="password" 
                      value={searchSettings.apiKey}
                      onChange={(e) => updateLocalConfig('searchSettings', { apiKey: e.target.value })}
                      className="w-full px-4 py-3 bg-accent rounded-xl border-none focus:ring-2 focus:ring-primary text-sm font-mono"
                      placeholder={
                        searchSettings.engine === 'tavily' ? 'tvly-xxxxx...' :
                        searchSettings.engine === 'bing' ? 'your-bing-api-key' :
                        'YOUR_API_KEY|YOUR_SEARCH_ENGINE_ID'
                      }
                    />
                    <div className="px-2 space-y-1">
                      {searchSettings.engine === 'tavily' && (
                        <>
                          <p className="text-[10px] text-muted-foreground">
                            {t('settings.search.tavilyHint')}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            <a href="https://tavily.com" target="_blank" className="text-primary hover:underline">{t('settings.search.tavilyLink')}</a>
                          </p>
                        </>
                      )}
                      {searchSettings.engine === 'bing' && (
                        <>
                          <p className="text-[10px] text-muted-foreground">
                            {t('settings.search.bingHint')}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            <a href="https://portal.azure.com" target="_blank" className="text-primary hover:underline">{t('settings.search.bingLink')}</a>
                          </p>
                        </>
                      )}
                      {searchSettings.engine === 'google' && (
                        <>
                          <p className="text-[10px] text-muted-foreground">
                            {t('settings.search.googleHint')}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {t('settings.search.googleFormat')}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            <a href="https://console.cloud.google.com" target="_blank" className="text-primary hover:underline">{t('settings.search.googleLink')}</a>
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {!searchSettings.apiKey && (
                    <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-500">{t('settings.search.apiKeyRequired')}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {t('settings.search.apiKeyRequiredHint')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'knowledge-base' && (
              <div className="space-y-6 animate-in fade-in">
                <KnowledgeBaseSettings 
                  retrievalSettings={retrievalSettings}
                  onUpdateRetrievalSettings={(updates) => updateLocalConfig('retrievalSettings', updates)}
                />
              </div>
            )}

            {activeTab === 'proxy' && (
              <div className="space-y-6 animate-in fade-in">
                <h3 className="text-lg font-semibold border-b pb-2">{t('settings.proxy.title')}</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-xl border bg-card">
                    <div className="space-y-1 flex-1">
                      <p className="font-medium text-sm">{t('settings.proxy.proxyMode')}</p>
                      <p className="text-xs text-muted-foreground">{t('settings.proxy.proxyHint')}</p>
                      
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-4">
                      <input 
                        type="checkbox" 
                        checked={proxy.enabled}
                        onChange={(e) => updateLocalConfig('proxy', { enabled: e.target.checked })}
                        className="sr-only peer" 
                      />
                      <div className={cn(
                        "w-11 h-6 bg-accent peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"
                      )}></div>
                    </label>
                  </div>

                  {proxy.enabled && (
                    <div className="space-y-4 animate-in slide-in-from-top-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">{t('settings.proxy.cloudProxyUrl')}</label>
                        <input 
                          type="text" 
                          value={proxy.cloudUrl || ''}
                          onChange={(e) => updateLocalConfig('proxy', { cloudUrl: e.target.value })}
                          placeholder={`${window.location.origin}${getProxyApiUrl()}`}
                          className="w-full px-4 py-3 bg-accent rounded-xl border-none focus:ring-2 focus:ring-primary text-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                          {t('settings.proxy.cloudProxyHint')}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex gap-4">
                        <Shield className="w-6 h-6 text-green-500 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium">{t('settings.security.encryptionEnabled')}</p>
                          <p className="text-xs text-muted-foreground">{t('settings.security.encryptionHint')}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6 animate-in fade-in">
                <h3 className="text-lg font-semibold border-b pb-2">{t('settings.security.title')}</h3>
                <div className="space-y-4">
                   <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex gap-4">
                      <Shield className="w-6 h-6 text-green-500 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">{t('settings.security.encryptionEnabled')}</p>
                        <p className="text-xs text-muted-foreground">{t('settings.security.encryptionHint')}</p>
                      </div>
                   </div>

                   <div className="flex items-center justify-between p-4 rounded-xl border bg-card">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{t('settings.security.cloudSync')}</p>
                      <p className="text-xs text-muted-foreground">{t('settings.security.cloudSyncHint')}</p>
                      
                      {/* 同步服务状态显示 */}
                      {cloudSync?.enabled && (
                        <div className="mt-2 flex items-center gap-2 text-xs">
                          {proxyStatus.isAvailable ? (
                            <>
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                              <span className="text-green-600 dark:text-green-400">
                                {t('settings.security.syncServerOnline')}
                              </span>
                            </>
                          ) : (
                            <>
                              <div className="w-2 h-2 bg-red-500 rounded-full" />
                              <span className="text-red-600 dark:text-red-400">
                                {t('settings.security.syncServerOffline')}
                              </span>
                            </>
                          )}
                        </div>
                      )}
                      
                      {/* 错误提示 */}
                      {cloudSyncError && (
                        <div className="mt-2 p-2 rounded bg-red-500/10 border border-red-500/20">
                          <p className="text-xs text-red-600 dark:text-red-400">{cloudSyncError}</p>
                        </div>
                      )}
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-4">
                      <input 
                        type="checkbox" 
                        checked={cloudSync?.enabled ?? false}
                        onChange={async (e) => {
                          const enabled = e.target.checked;
                          setCloudSyncError(null);
                          updateLocalConfig('cloudSync', { enabled });
                          
                          if (enabled) {
                            // 异步检查但不阻塞
                            syncService.checkProxyHealth().then(isHealthy => {
                              setProxyStatus(syncService.getProxyStatus());
                              if (!isHealthy) {
                                setCloudSyncError(t('settings.security.syncServerNotAvailable'));
                              }
                            });
                          }
                        }}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-accent peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  
                  {/* 云端同步配置详情 */}
                  {cloudSync?.enabled && (
                    <div className="space-y-4 mt-4 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800 animate-in slide-in-from-top-2">
                      {/* API URL配置 */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">{t('settings.security.syncApiUrl')}</label>
                          <button
                            onClick={async () => {
                              setIsTestingSync(true);
                              setCloudSyncError(null);
                              // 临时将当前填写的URL同步到syncService供检查（通过更新Store实现）
                              // 注意：这里需要先把本地URL同步到Store才能让syncService读到
                              // 但为了简单，我们可以暂时直接调用checkProxyHealth，它会读store
                              // 所以我们必须先应用一次本地配置
                              const success = await applyAllChanges();
                              if (success) {
                                const isHealthy = await syncService.checkProxyHealth(true); // 强制检查
                                setProxyStatus(syncService.getProxyStatus());
                                if (!isHealthy) {
                                  setCloudSyncError(t('settings.security.syncServerNotAvailable'));
                                } else {
                                  alert(t('settings.security.syncServerOnline'));
                                }
                              }
                              setIsTestingSync(false);
                            }}
                            disabled={isTestingSync}
                            className="text-xs text-primary hover:underline flex items-center gap-1"
                          >
                            {isTestingSync ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Activity className="w-3 h-3" />}
                            {t('settings.llm.testConnection')}
                          </button>
                        </div>
                        <input
                          type="text"
                          value={cloudSync.apiUrl || ''}
                          onChange={(e) => {
                            updateLocalConfig('cloudSync', { apiUrl: e.target.value });
                            if (cloudSyncError) setCloudSyncError(null);
                          }}
                          onBlur={(e) => {
                            // 失去焦点时自动清理末尾斜杠和空格，实现无脑适配
                            const cleanedUrl = e.target.value.trim().replace(/\/+$/, '');
                            updateLocalConfig('cloudSync', { apiUrl: cleanedUrl });
                          }}
                          placeholder={t('settings.security.syncApiUrlPlaceholder') || "留空则使用默认路径 (/api/sync)"}
                          className="w-full px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary text-sm"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {t('settings.security.syncApiUrlHint')}
                        </p>
                      </div>

                      {/* 自动同步 */}
                      <div className="flex items-start justify-between">
                        <div>
                          <label className="text-sm font-medium">{t('settings.security.autoSync')}</label>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {t('settings.security.autoSyncHint')}
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer ml-4">
                          <input
                            type="checkbox"
                            checked={cloudSync.autoSync ?? true}
                            onChange={(e) => updateLocalConfig('cloudSync', { autoSync: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-accent peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>

                      {/* 同步状态显示 */}
                      <SyncStatusIndicator />

                      {/* 手动同步按钮 (注意：这会立即触发同步，但前提是配置已保存) */}
                      <button
                        onClick={handleManualSync}
                        disabled={storeCloudSync?.syncStatus === 'syncing' || !cloudSync?.apiUrl}
                        className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-medium transition-colors"
                      >
                        <RefreshCw className={cn(
                          "w-4 h-4",
                          storeCloudSync?.syncStatus === 'syncing' && "animate-spin"
                        )} />
                        {t('settings.security.syncNow')}
                      </button>
                    </div>
                  )}
                   
                   <div className="space-y-2">
                    <label className="text-sm font-medium">{t('settings.security.persistence')}</label>
                    <div className="relative">
                      <button
                          type="button"
                          onClick={() => setOpenGeneralDropdown(openGeneralDropdown === 'persistence' ? null : 'persistence')}
                          className="w-full px-4 py-3 bg-accent rounded-xl border-none focus:ring-2 focus:ring-primary text-sm flex items-center justify-between hover:bg-accent/80 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="truncate">
                              {(localConfig.persistenceMode || persistenceMode) === 'none' ? t('settings.security.persistenceNone') : 
                              (localConfig.persistenceMode || persistenceMode) === '1d' ? t('settings.security.persistence1d') :
                              (localConfig.persistenceMode || persistenceMode) === '5d' ? t('settings.security.persistence5d') :
                              (localConfig.persistenceMode || persistenceMode) === '10d' ? t('settings.security.persistence10d') :
                              (localConfig.persistenceMode || persistenceMode) === '30d' ? t('settings.security.persistence30d') : t('common.unknown')}
                            </span>
                          </div>
                          <ChevronDown className={cn("w-4 h-4 opacity-50 transition-transform duration-300 flex-shrink-0 ml-2", openGeneralDropdown === 'persistence' && "rotate-180")} />
                        </button>

                        {openGeneralDropdown === 'persistence' && (
                          <>
                            <div 
                              className="fixed inset-0 z-[80]" 
                              onClick={() => setOpenGeneralDropdown(null)}
                              onWheel={(e) => e.stopPropagation()}
                            />
                            <div className="absolute top-full left-0 mt-2 w-full bg-card border rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[100]">
                              <div className="p-2 border-b flex items-center justify-center bg-accent/20">
                                <span className="text-xs font-black text-primary uppercase tracking-widest">{t('settings.security.selectDuration')}</span>
                              </div>
                            <div className="max-h-[400px] overflow-y-auto p-2 custom-scrollbar space-y-1">
                              {[
                                { value: 'none', label: t('settings.security.persistenceNone') },
                                { value: '1d', label: t('settings.security.persistence1d') },
                                { value: '5d', label: t('settings.security.persistence5d') },
                                { value: '10d', label: t('settings.security.persistence10d') },
                                { value: '30d', label: t('settings.security.persistence30d') }
                              ].map(option => {
                                const isSelected = (localConfig.persistenceMode || persistenceMode) === option.value;
                                return (
                                  <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                      setLocalConfig(prev => ({ ...prev, persistenceMode: option.value }));
                                      setOpenGeneralDropdown(null);
                                    }}
                                    className={cn(
                                      "w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between group/item border border-transparent",
                                      isSelected 
                                        ? "bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20" 
                                        : "hover:bg-primary/5 hover:border-primary/20"
                                    )}
                                  >
                                    <span className="text-xs truncate">{option.label}</span>
                                    {isSelected && <Check className="w-3.5 h-3.5" />}
                                  </button>
                                );
                              })}
                            </div>
                            </div>
                          </>
                        )}
                    </div>
                    <p className="text-[10px] text-muted-foreground px-1">{t('settings.security.persistenceHint')}</p>
                  </div>

                   <div className="grid grid-cols-1 gap-3">
                      <button 
                        onClick={handleExportBackup}
                        className="w-full px-4 py-3 bg-accent hover:bg-accent/80 rounded-xl text-sm font-medium transition-colors"
                      >
                        {t('settings.security.exportBackup')}
                      </button>
                      <button 
                        onClick={handleImportBackup}
                        className="w-full px-4 py-3 bg-accent hover:bg-accent/80 rounded-xl text-sm font-medium transition-colors"
                      >
                        {t('settings.security.importBackup')}
                      </button>
                      <button 
                        onClick={handleSignOut}
                        className="w-full px-4 py-3 border border-destructive/30 text-destructive hover:bg-destructive/10 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <LogOut className="w-4 h-4" /> {t('settings.security.signOut')}
                      </button>
                      <button 
                        onClick={handleClearData}
                        className="w-full px-4 py-3 border border-destructive/30 text-destructive hover:bg-destructive/10 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" /> {t('settings.security.clearData')}
                      </button>
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'logs' && (
              <div className="h-full flex flex-col animate-in fade-in">
                <div className="flex-1 min-h-0">
                  <SystemLogs searchQuery={logSearchQuery} />
                </div>
              </div>
            )}

            {activeTab === 'help' && (
              <div className="h-full overflow-y-auto custom-scrollbar animate-in fade-in">
                <HelpGuide />
              </div>
            )}

            {activeTab === 'general' && (
              <div className="space-y-6 animate-in fade-in">
                <h3 className="text-lg font-semibold border-b pb-2">{t('settings.general.title')}</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('settings.general.language')}</label>
                    {renderGeneralSelector(
                      [
                        { value: 'zh-CN', label: '简体中文' },
                        { value: 'zh-TW', label: '繁體中文' },
                        { value: 'en-US', label: 'English' },
                        { value: 'ja-JP', label: '日本語' },
                        { value: 'ko-KR', label: '한국어' }
                      ],
                      general.language,
                      (value) => updateLocalConfig('general', { language: value }),
                      t('settings.general.selectLanguage')
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('settings.general.theme')}</label>
                    {renderGeneralSelector(
                      [
                        { value: 'system', label: t('settings.general.systemTheme') },
                        { value: 'light', label: t('settings.general.lightTheme') },
                        { value: 'dark', label: t('settings.general.darkTheme') }
                      ],
                      general.theme,
                      (value) => updateLocalConfig('general', { theme: value }),
                      t('settings.general.selectTheme')
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'presets' && (
              <div className="space-y-6 animate-in fade-in">
                <h3 className="text-lg font-semibold border-b pb-2">{t('settings.presets.title')}</h3>
                <div className="space-y-4">
                  {[
                    { key: 'chat', label: t('settings.presets.chatModel') },
                    { key: 'naming', label: t('settings.presets.namingModel') },
                    { key: 'search', label: t('settings.presets.searchModel') },
                    { key: 'compression', label: t('settings.presets.compressionModel') },
                    { key: 'ocr', label: t('settings.presets.ocrModel') }
                  ].map(field => (
                    <div key={field.key} className="space-y-2">
                      <label className="text-sm font-medium">{field.label}</label>
                      <ModelSelector
                        label={field.label}
                        value={defaultModels[field.key]}
                        onChange={(modelId) => updateLocalConfig('defaultModels', { [field.key]: modelId })}
                        providers={providers}
                        type={field.key}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'conversation' && (
              <div className="space-y-8 animate-in fade-in">
                {/* 新对话的预设设定 */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold border-b pb-2">{t('settings.conversation.newConversationPresets')}</h3>
                  
                  {/* 提示 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('settings.conversation.prompt')}</label>
                    <textarea
                      value={conversationPresets.systemPrompt}
                      onChange={(e) => updateLocalConfig('conversationPresets', { systemPrompt: e.target.value })}
                      placeholder={t('settings.conversation.promptPlaceholder')}
                      className="w-full px-4 py-3 bg-accent/50 rounded-xl border border-border/50 focus:ring-2 focus:ring-primary focus:border-primary text-sm min-h-[100px] resize-none"
                    />
                    <button
                      onClick={() => updateLocalConfig('conversationPresets', {
                        systemPrompt: '',
                        contextLimit: null,
                        temperature: null,
                        topP: null,
                        topK: null,
                        frequencyPenalty: null,
                        presencePenalty: null,
                        maxTokens: null,
                        stream: true
                      })}
                      className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      {t('settings.conversation.resetToDefault')}
                    </button>
                  </div>

                  {/* 上下文消息数量限制 */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium">{t('settings.conversation.contextLimit')}</label>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max="65"
                        step="1"
                        value={conversationPresets.contextLimit ?? 65}
                        onChange={(e) => {
                          const numValue = parseInt(e.target.value);
                          updateLocalConfig('conversationPresets', { contextLimit: numValue === 65 ? null : numValue });
                        }}
                        className="flex-1 h-2 bg-accent/50 rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                      <span className="text-sm font-medium min-w-[60px] text-right">
                        {conversationPresets.contextLimit === null ? t('settings.conversation.unlimited') : conversationPresets.contextLimit}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{t('settings.conversation.contextLimitHint')}</p>
                  </div>

                  {/* 温度 */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium">{t('settings.conversation.temperature')}</label>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="-0.1"
                        max="2"
                        step="0.1"
                        value={conversationPresets.temperature ?? -0.1}
                        onChange={(e) => {
                          const numValue = parseFloat(e.target.value);
                          updateLocalConfig('conversationPresets', { temperature: numValue < 0 ? null : numValue });
                        }}
                        className="flex-1 h-2 bg-accent/50 rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                      <span className="text-sm font-medium min-w-[60px] text-right">
                        {conversationPresets.temperature === null ? t('settings.conversation.notSet') : conversationPresets.temperature.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  {/* Top P */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium">{t('settings.conversation.topP')}</label>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="-0.05"
                        max="1"
                        step="0.05"
                        value={conversationPresets.topP ?? -0.05}
                        onChange={(e) => {
                          const numValue = parseFloat(e.target.value);
                          updateLocalConfig('conversationPresets', { topP: numValue < 0 ? null : numValue });
                        }}
                        className="flex-1 h-2 bg-accent/50 rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                      <span className="text-sm font-medium min-w-[60px] text-right">
                        {conversationPresets.topP === null ? t('settings.conversation.notSet') : conversationPresets.topP.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* 流式输出 */}
                  <div className="flex items-center justify-between py-3">
                    <label className="text-sm font-medium">{t('settings.conversation.streaming')}</label>
                    <button
                      onClick={() => updateLocalConfig('conversationPresets', { stream: !conversationPresets.stream })}
                      className={cn(
                        "relative w-11 h-6 rounded-full transition-colors",
                        conversationPresets.stream ? "bg-primary" : "bg-accent"
                      )}
                    >
                      <div className={cn(
                        "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform",
                        conversationPresets.stream && "translate-x-5"
                      )} />
                    </button>
                  </div>
                </div>

                {/* 对话设定 */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold border-b pb-2">{t('settings.conversation.conversationSettings')}</h3>
                  
                  {/* 显示部分 */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t('settings.conversation.display')}</h4>
                    
                    <div className="flex items-center justify-between py-3">
                      <label className="text-sm">{t('settings.conversation.showWordCount')}</label>
                      <button
                        onClick={() => updateLocalConfig('conversationSettings', { display: { ...conversationSettings.display, showWordCount: !conversationSettings.display.showWordCount } })}
                        className={cn(
                          "relative w-11 h-6 rounded-full transition-colors",
                          conversationSettings.display.showWordCount ? "bg-primary" : "bg-accent"
                        )}
                      >
                        <div className={cn(
                          "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform",
                          conversationSettings.display.showWordCount && "translate-x-5"
                        )} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <label className="text-sm">{t('settings.conversation.showTokenCount')}</label>
                      <button
                        onClick={() => updateLocalConfig('conversationSettings', { display: { ...conversationSettings.display, showTokenCount: !conversationSettings.display.showTokenCount } })}
                        className={cn(
                          "relative w-11 h-6 rounded-full transition-colors",
                          conversationSettings.display.showTokenCount ? "bg-primary" : "bg-accent"
                        )}
                      >
                        <div className={cn(
                          "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform",
                          conversationSettings.display.showTokenCount && "translate-x-5"
                        )} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <label className="text-sm">{t('settings.conversation.showModelName')}</label>
                      <button
                        onClick={() => updateLocalConfig('conversationSettings', { display: { ...conversationSettings.display, showModelName: !conversationSettings.display.showModelName } })}
                        className={cn(
                          "relative w-11 h-6 rounded-full transition-colors",
                          conversationSettings.display.showModelName ? "bg-primary" : "bg-accent"
                        )}
                      >
                        <div className={cn(
                          "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform",
                          conversationSettings.display.showModelName && "translate-x-5"
                        )} />
                      </button>
                    </div>
                  </div>

                  {/* 功能部分 */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t('settings.conversation.features')}</h4>
                    
                    <div className="flex items-center justify-between py-3">
                      <label className="text-sm">{t('settings.conversation.autoCollapseCode')}</label>
                      <button
                        onClick={() => updateLocalConfig('conversationSettings', { features: { ...conversationSettings.features, autoCollapseCode: !conversationSettings.features.autoCollapseCode } })}
                        className={cn(
                          "relative w-11 h-6 rounded-full transition-colors",
                          conversationSettings.features.autoCollapseCode ? "bg-primary" : "bg-accent"
                        )}
                      >
                        <div className={cn(
                          "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform",
                          conversationSettings.features.autoCollapseCode && "translate-x-5"
                        )} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <label className="text-sm">{t('settings.conversation.autoGenerateTitle')}</label>
                      <button
                        onClick={() => updateLocalConfig('conversationSettings', { features: { ...conversationSettings.features, autoGenerateTitle: !conversationSettings.features.autoGenerateTitle } })}
                        className={cn(
                          "relative w-11 h-6 rounded-full transition-colors",
                          conversationSettings.features.autoGenerateTitle ? "bg-primary" : "bg-accent"
                        )}
                      >
                        <div className={cn(
                          "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform",
                          conversationSettings.features.autoGenerateTitle && "translate-x-5"
                        )} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <label className="text-sm">{t('settings.conversation.spellCheck')}</label>
                      <button
                        onClick={() => updateLocalConfig('conversationSettings', { features: { ...conversationSettings.features, spellCheck: !conversationSettings.features.spellCheck } })}
                        className={cn(
                          "relative w-11 h-6 rounded-full transition-colors",
                          conversationSettings.features.spellCheck ? "bg-primary" : "bg-accent"
                        )}
                      >
                        <div className={cn(
                          "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform",
                          conversationSettings.features.spellCheck && "translate-x-5"
                        )} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <label className="text-sm">{t('settings.conversation.markdownRender')}</label>
                      <button
                        onClick={() => updateLocalConfig('conversationSettings', { features: { ...conversationSettings.features, markdownRender: !conversationSettings.features.markdownRender } })}
                        className={cn(
                          "relative w-11 h-6 rounded-full transition-colors",
                          conversationSettings.features.markdownRender ? "bg-primary" : "bg-accent"
                        )}
                      >
                        <div className={cn(
                          "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform",
                          conversationSettings.features.markdownRender && "translate-x-5"
                        )} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <div className="space-y-0.5">
                        <label className="text-sm">{t('settings.conversation.latexRender')}</label>
                      </div>
                      <button
                        onClick={() => updateLocalConfig('conversationSettings', { features: { ...conversationSettings.features, latexRender: !conversationSettings.features.latexRender } })}
                        className={cn(
                          "relative w-11 h-6 rounded-full transition-colors",
                          conversationSettings.features.latexRender ? "bg-primary" : "bg-accent"
                        )}
                      >
                        <div className={cn(
                          "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform",
                          conversationSettings.features.latexRender && "translate-x-5"
                        )} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <label className="text-sm">{t('settings.conversation.mermaidRender')}</label>
                      <button
                        onClick={() => updateLocalConfig('conversationSettings', { features: { ...conversationSettings.features, mermaidRender: !conversationSettings.features.mermaidRender } })}
                        className={cn(
                          "relative w-11 h-6 rounded-full transition-colors",
                          conversationSettings.features.mermaidRender ? "bg-primary" : "bg-accent"
                        )}
                      >
                        <div className={cn(
                          "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform",
                          conversationSettings.features.mermaidRender && "translate-x-5"
                        )} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <div className="space-y-0.5">
                        <label className="text-sm">{t('settings.conversation.autoPreviewArtifacts')}</label>
                        <p className="text-xs text-muted-foreground">{t('settings.conversation.autoPreviewHint')}</p>
                      </div>
                      <button
                        onClick={() => updateLocalConfig('conversationSettings', { features: { ...conversationSettings.features, autoPreviewArtifacts: !conversationSettings.features.autoPreviewArtifacts } })}
                        className={cn(
                          "relative w-11 h-6 rounded-full transition-colors",
                          conversationSettings.features.autoPreviewArtifacts ? "bg-primary" : "bg-accent"
                        )}
                      >
                        <div className={cn(
                          "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform",
                          conversationSettings.features.autoPreviewArtifacts && "translate-x-5"
                        )} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <div className="space-y-0.5">
                        <label className="text-sm">{t('settings.conversation.pasteAsFile')}</label>
                        <p className="text-xs text-muted-foreground">{t('settings.conversation.pasteAsFileHint')}</p>
                      </div>
                      <button
                        onClick={() => updateLocalConfig('conversationSettings', { features: { ...conversationSettings.features, pasteAsFile: !conversationSettings.features.pasteAsFile } })}
                        className={cn(
                          "relative w-11 h-6 rounded-full transition-colors",
                          conversationSettings.features.pasteAsFile ? "bg-primary" : "bg-accent"
                        )}
                      >
                        <div className={cn(
                          "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform",
                          conversationSettings.features.pasteAsFile && "translate-x-5"
                        )} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Compression Settings */}
                <div>
                  <h4 className="text-sm font-semibold mb-3">{t('compression.autoCompression')}</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{t('compression.autoCompression')}</p>
                        <p className="text-xs text-muted-foreground">{t('compression.autoCompressionHint')}</p>
                      </div>
                      <button
                        onClick={() => updateLocalConfig('conversationSettings', { compression: { ...conversationSettings.compression, autoCompress: !conversationSettings.compression.autoCompress } })}
                        className={cn(
                          "relative w-11 h-6 rounded-full transition-colors",
                          conversationSettings.compression.autoCompress ? "bg-primary" : "bg-accent"
                        )}
                      >
                        <div className={cn(
                          "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform",
                          conversationSettings.compression.autoCompress && "translate-x-5"
                        )} />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t('compression.autoCompressionThreshold')}</label>
                      <p className="text-xs text-muted-foreground mb-2">{t('compression.autoCompressionThresholdHint')}</p>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="10"
                          max="200"
                          step="10"
                          value={conversationSettings.compression.autoCompressThreshold}
                          onChange={(e) => updateLocalConfig('conversationSettings', { compression: { ...conversationSettings.compression, autoCompressThreshold: parseInt(e.target.value) } })}
                          className="flex-1 h-2 bg-accent rounded-lg appearance-none cursor-pointer"
                          style={{
                            background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${((conversationSettings.compression.autoCompressThreshold - 10) / 190) * 100}%, hsl(var(--accent)) ${((conversationSettings.compression.autoCompressThreshold - 10) / 190) * 100}%, hsl(var(--accent)) 100%)`
                          }}
                        />
                        <span className="text-sm font-mono min-w-[80px] text-right">{conversationSettings.compression.autoCompressThreshold} {t('compression.messages')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-accent/10 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2 rounded-xl text-sm font-medium hover:bg-accent transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button 
            onClick={handleSaveOnly}
            className="px-6 py-2 bg-accent text-accent-foreground rounded-xl text-sm font-medium hover:bg-accent/80 transition-all flex items-center justify-center"
          >
            {t('common.save')}
          </button>
          <button 
            onClick={handleApply}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 shadow-lg shadow-primary/20 transition-all flex items-center justify-center"
          >
            {t('settings.footer.saveAndApply')}
          </button>
        </div>
      </div>

      {/* Model Editing Dialog */}
      {editingModel && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl border p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold">{editingModel.isNew ? t('settings.llm.newModel') : t('settings.llm.editModel')}</h3>
              <button onClick={() => setEditingModel(null)} className="p-1 hover:bg-accent rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">{t('model.modelId')}</label>
                <input
                  type="text"
                  value={editingModel.id}
                  onChange={(e) => {
                    const newId = e.target.value;
                    setEditingModel(prev => {
                      // Auto-infer display name when model ID changes
                      // Only update if: 1) it's a new model, 2) name is empty or 3) name matches previous inference
                      const shouldInferName = prev.isNew && (!prev.name || prev.name === inferModelDisplayName(prev.id, prev.providerId));
                      const inferredName = shouldInferName ? inferModelDisplayName(newId, prev.providerId) : prev.name;
                      
                      return {
                        ...prev,
                        id: newId,
                        name: inferredName || prev.name
                      };
                    });
                  }}
                  placeholder={t('model.modelIdPlaceholder')}
                  className="w-full px-3 py-2 bg-accent rounded-lg border-none focus:ring-2 focus:ring-primary text-sm font-mono"
                  disabled={!editingModel.isNew}
                />
                <p className="text-[10px] text-muted-foreground px-1">{t('model.modelIdHint')}</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">{t('model.displayName')}</label>
                <div className="relative flex gap-2">
                  <input
                    type="text"
                    value={editingModel.name}
                    onChange={(e) => setEditingModel(prev => ({ ...prev, name: e.target.value }))}
                    placeholder={t('model.displayNamePlaceholder')}
                    className="flex-1 px-3 py-2 bg-accent rounded-lg border-none focus:ring-2 focus:ring-primary text-sm"
                  />
                  {!editingModel.isNew && editingModel.id && (
                    <button
                      onClick={() => {
                        const inferredName = inferModelDisplayName(editingModel.id, editingModel.providerId);
                        if (inferredName) {
                          setEditingModel(prev => ({ ...prev, name: inferredName }));
                        }
                      }}
                      className="px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors flex items-center justify-center"
                      title={t('model.autoInferHint')}
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground px-1">{t('model.displayNameHint')}</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">{t('model.capabilities.title')}</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingModel(prev => ({
                      ...prev,
                      capabilities: { ...prev.capabilities, thinking: !prev.capabilities?.thinking }
                    }))}
                    className={cn(
                      "flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5",
                      editingModel.capabilities?.thinking
                        ? "bg-orange-500/10 text-orange-500 ring-1 ring-orange-500/20 shadow-sm shadow-orange-500/10"
                        : "bg-accent/30 text-muted-foreground/30 grayscale"
                    )}
                  >
                    <Brain className="w-3.5 h-3.5" /> {t('model.capabilities.thinking')}
                  </button>
                  <button
                    onClick={() => setEditingModel(prev => ({
                      ...prev,
                      capabilities: { ...prev.capabilities, multimodal: !prev.capabilities?.multimodal }
                    }))}
                    className={cn(
                      "flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5",
                      editingModel.capabilities?.multimodal
                        ? "bg-purple-500/10 text-purple-500 ring-1 ring-purple-500/20 shadow-sm shadow-purple-500/10"
                        : "bg-accent/30 text-muted-foreground/30 grayscale"
                    )}
                  >
                    <Camera className="w-3.5 h-3.5" /> {t('model.capabilities.multimodal')}
                  </button>
                  <button
                    onClick={() => setEditingModel(prev => ({
                      ...prev,
                      capabilities: { ...prev.capabilities, imageGen: !prev.capabilities?.imageGen }
                    }))}
                    className={cn(
                      "flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5",
                      editingModel.capabilities?.imageGen
                        ? "bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/20 shadow-sm shadow-blue-500/10"
                        : "bg-accent/30 text-muted-foreground/30 grayscale"
                    )}
                  >
                    <ImageIcon className="w-3.5 h-3.5" /> {t('model.capabilities.imageGen')}
                  </button>
                  <button
                    onClick={() => setEditingModel(prev => ({
                      ...prev,
                      capabilities: { ...prev.capabilities, tools: !prev.capabilities?.tools }
                    }))}
                    className={cn(
                      "flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5",
                      editingModel.capabilities?.tools
                        ? "bg-green-500/10 text-green-500 ring-1 ring-green-500/20 shadow-sm shadow-green-500/10"
                        : "bg-accent/30 text-muted-foreground/30 grayscale"
                    )}
                  >
                    <Sparkles className="w-3.5 h-3.5" /> {t('model.capabilities.tools')}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">{t('model.contextWindow')}</label>
                  <input
                    type="text"
                    value={formatNumberWithCommas(editingModel.contextWindow)}
                    onChange={(e) => {
                      const value = parseFormattedNumber(e.target.value);
                      setEditingModel(prev => ({ ...prev, contextWindow: value }));
                    }}
                    onWheel={(e) => e.target.blur()}
                    placeholder={t('model.defaultUnlimited')}
                    className="w-full px-3 py-2 bg-accent rounded-lg border-none focus:ring-2 focus:ring-primary text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">{t('model.maxOutput')}</label>
                  <input
                    type="text"
                    value={formatNumberWithCommas(editingModel.maxTokens)}
                    onChange={(e) => {
                      const value = parseFormattedNumber(e.target.value);
                      setEditingModel(prev => ({ ...prev, maxTokens: value }));
                    }}
                    onWheel={(e) => e.target.blur()}
                    placeholder={t('model.defaultUnlimited')}
                    className="w-full px-3 py-2 bg-accent rounded-lg border-none focus:ring-2 focus:ring-primary text-sm"
                  />
                </div>
              </div>

              {editingModel.capabilities?.thinking && (
                <div className="space-y-1.5 animate-in slide-in-from-top-2">
                  <label className="text-sm font-medium">{t('model.maxThinking')}</label>
                  <input
                    type="text"
                    value={formatNumberWithCommas(editingModel.maxThinkingTokens)}
                    onChange={(e) => {
                      const value = parseFormattedNumber(e.target.value);
                      setEditingModel(prev => ({ ...prev, maxThinkingTokens: value }));
                    }}
                    onWheel={(e) => e.target.blur()}
                    placeholder={t('model.defaultUnlimited')}
                    className="w-full px-3 py-2 bg-accent rounded-lg border-none focus:ring-2 focus:ring-primary text-sm"
                  />
                  <p className="text-[10px] text-muted-foreground px-1">{t('model.maxThinkingHint')}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setEditingModel(null)}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={() => {
                  if (!editingModel.id || !editingModel.name) {
                    alert(t('model.fillRequired'));
                    return;
                  }

                  if (editingModel.isNew) {
                    // Check for duplicate ID
                    const provider = providers.find(p => p.id === editingModel.providerId);
                    if (provider?.models?.some(m => m.id === editingModel.id)) {
                      alert(t('model.idExists'));
                      return;
                    }

                    const newModel = {
                      id: editingModel.id,
                      name: editingModel.name,
                      selected: false,
                      capabilities: editingModel.capabilities,
                      contextWindow: editingModel.contextWindow,
                      maxTokens: editingModel.maxTokens,
                      maxThinkingTokens: editingModel.maxThinkingTokens
                    };
                    
                    const updatedProviders = providers.map(p => 
                      p.id === editingModel.providerId 
                        ? { ...p, models: [...(p.models || []), newModel] } 
                        : p
                    );
                    updateLocalConfig('providers', updatedProviders);
                    
                    setEditingProvider(prev => ({
                      ...prev,
                      models: [...(prev.models || []), newModel]
                    }));
                  } else {
                    const updatedProviders = providers.map(p => 
                      p.id === editingModel.providerId 
                        ? { 
                            ...p, 
                            models: p.models.map(m => m.id === editingModel.id ? {
                              ...m,
                              name: editingModel.name,
                              capabilities: editingModel.capabilities,
                              contextWindow: editingModel.contextWindow,
                              maxTokens: editingModel.maxTokens,
                              maxThinkingTokens: editingModel.maxThinkingTokens
                            } : m) 
                          } 
                        : p
                    );
                    updateLocalConfig('providers', updatedProviders);

                    setEditingProvider(prev => ({
                      ...prev,
                      models: prev.models.map(m => 
                        m.id === editingModel.id 
                          ? { 
                              ...m, 
                              name: editingModel.name, 
                              capabilities: editingModel.capabilities,
                              contextWindow: editingModel.contextWindow,
                              maxTokens: editingModel.maxTokens,
                              maxThinkingTokens: editingModel.maxThinkingTokens
                            }
                          : m
                      )
                    }));
                  }
                  setEditingModel(null);
                }}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              >
                {editingModel.isNew ? t('common.create') : t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsModal;
