/**
 * 应用诊断工具
 * 用于系统状态检查、依赖验证及故障排查。
 */

/**
 * 检查关键依赖是否正常加载
 * @returns {object} 依赖检查结果
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
 * 检查数据库连通性及状态
 * @returns {Promise<object>} 数据库状态报告
 */
export const checkDatabase = async () => {
  try {
    const { db } = await import('../db');
    
    const settingsCount = await db.settings.count();
    const conversationsCount = await db.conversations.count();
    
    return { success: true, settingsCount, conversationsCount };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * 检查全局 Store 状态
 * @returns {Promise<object>} Store 状态报告
 */
export const checkStores = async () => {
  try {
    const { useI18nStore } = await import('../i18n');
    const { useConfigStore } = await import('../store/useConfigStore');
    const { useAuthStore } = await import('../store/useAuthStore');

    useI18nStore.getState();
    useConfigStore.getState();
    useAuthStore.getState();

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * 检查 i18n 翻译系统
 * @returns {Promise<object>} 翻译系统状态报告
 */
export const checkTranslations = async () => {
  try {
    const { translations } = await import('../i18n/translations');
    Object.keys(translations);

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * 运行全量系统诊断
 * @returns {Promise<object>} 完整诊断报告
 */
export const runDiagnostics = async () => {
  return {
    dependencies: checkDependencies(),
    database: await checkDatabase(),
    stores: await checkStores(),
    translations: await checkTranslations()
  };
};

if (typeof window !== 'undefined' && import.meta.env.DEV) {
  window.__AiPiBoxDiagnostics = {
    checkDependencies,
    checkDatabase,
    checkStores,
    checkTranslations,
    runDiagnostics
  };
}