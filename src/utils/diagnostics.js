/**
 * 应用诊断工具
 * 用于调试和排查白屏问题
 */

/**
 * 检查关键依赖是否正常加载
 */
export const checkDependencies = () => {
  const results = {
    react: typeof React !== 'undefined',
    reactDOM: typeof ReactDOM !== 'undefined',
    zustand: typeof window !== 'undefined',
    indexedDB: typeof indexedDB !== 'undefined',
    localStorage: typeof localStorage !== 'undefined',
  };

  return results;
};

/**
 * 检查数据库状态
 */
export const checkDatabase = async () => {
  try {
    const { db } = await import('../db');
    
    // 尝试访问数据库
    const settingsCount = await db.settings.count();
    const conversationsCount = await db.conversations.count();
    
    // Database accessible
    
    return { success: true, settingsCount, conversationsCount };
  } catch (error) {
    // Database error
    return { success: false, error: error.message };
  }
};

/**
 * 检查Store状态
 */
export const checkStores = async () => {
  try {
    const { useI18nStore } = await import('../i18n');
    const { useConfigStore } = await import('../store/useConfigStore');
    const { useAuthStore } = await import('../store/useAuthStore');

    const i18nState = useI18nStore.getState();
    const configState = useConfigStore.getState();
    const authState = useAuthStore.getState();

    // Store states checked

    return { success: true };
  } catch (error) {
    // Store error
    return { success: false, error: error.message };
  }
};

/**
 * 检查翻译系统
 */
export const checkTranslations = async () => {
  try {
    const { translations } = await import('../i18n/translations');
    const { SUPPORTED_LANGUAGES } = await import('../i18n');

    const availableLanguages = Object.keys(translations);
    const configuredLanguages = SUPPORTED_LANGUAGES.map(l => l.value);

    // Translation system checked

    return { success: true, availableLanguages };
  } catch (error) {
    // Translation error
    return { success: false, error: error.message };
  }
};

/**
 * 运行完整诊断
 */
export const runDiagnostics = async () => {
  const results = {
    dependencies: checkDependencies(),
    database: await checkDatabase(),
    stores: await checkStores(),
    translations: await checkTranslations()
  };

  return results;
};

// 在开发环境下暴露到window对象
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  window.__AiPiBoxDiagnostics = {
    checkDependencies,
    checkDatabase,
    checkStores,
    checkTranslations,
    runDiagnostics
  };
  
  // Diagnostics available via window.__AiPiBoxDiagnostics
}
