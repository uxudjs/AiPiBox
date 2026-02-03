// i18n系统验证脚本 - 检查翻译完整性和一致性
import { translations } from './translations';
import { SUPPORTED_LANGUAGES } from './index';

/**
 * 验证所有语言的翻译键结构一致性
 */
export const validateTranslationKeys = () => {
  const results = {
    success: true,
    errors: [],
    warnings: []
  };

  // 使用简体中文作为基准
  const baseLanguage = 'zh-CN';
  const baseKeys = getAllKeys(translations[baseLanguage]);
  
  // 检查其他语言是否包含所有基准键
  SUPPORTED_LANGUAGES.forEach(({ value: langCode }) => {
    if (langCode === baseLanguage) return;
    
    const currentKeys = getAllKeys(translations[langCode]);
    
    // 检查缺失的键
    const missingKeys = baseKeys.filter(key => !currentKeys.includes(key));
    if (missingKeys.length > 0) {
      results.success = false;
      results.errors.push({
        language: langCode,
        type: 'missing_keys',
        keys: missingKeys
      });
    }
    
    // 检查多余的键
    const extraKeys = currentKeys.filter(key => !baseKeys.includes(key));
    if (extraKeys.length > 0) {
      results.warnings.push({
        language: langCode,
        type: 'extra_keys',
        keys: extraKeys
      });
    }
  });
  
  return results;
};

/**
 * 递归获取对象的所有键路径
 */
const getAllKeys = (obj, prefix = '') => {
  let keys = [];
  
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys = keys.concat(getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  
  return keys;
};

/**
 * 检查翻译值是否包含参数占位符
 */
export const validateParameters = () => {
  const results = {
    success: true,
    inconsistencies: []
  };
  
  const paramPattern = /\{(\w+)\}/g;
  const baseLanguage = 'zh-CN';
  
  // 检查每个键的参数在所有语言中是否一致
  const baseKeys = getAllKeys(translations[baseLanguage]);
  
  baseKeys.forEach(key => {
    const params = {};
    
    SUPPORTED_LANGUAGES.forEach(({ value: langCode }) => {
      const value = getValueByPath(translations[langCode], key);
      if (typeof value === 'string') {
        const matches = [...value.matchAll(paramPattern)];
        params[langCode] = matches.map(m => m[1]).sort();
      }
    });
    
    // 检查所有语言的参数是否一致
    const baseParams = params[baseLanguage] || [];
    const inconsistent = Object.entries(params).filter(([lang, langParams]) => {
      return JSON.stringify(langParams) !== JSON.stringify(baseParams);
    });
    
    if (inconsistent.length > 0) {
      results.success = false;
      results.inconsistencies.push({
        key,
        base: baseParams,
        differences: Object.fromEntries(inconsistent)
      });
    }
  });
  
  return results;
};

/**
 * 根据点号分隔的路径获取对象值
 */
const getValueByPath = (obj, path) => {
  const keys = path.split('.');
  let value = obj;
  
  for (const key of keys) {
    if (value && typeof value === 'object') {
      value = value[key];
    } else {
      return undefined;
    }
  }
  
  return value;
};

/**
 * 检查是否有空翻译值
 */
export const validateEmptyValues = () => {
  const results = {
    success: true,
    emptyValues: []
  };
  
  SUPPORTED_LANGUAGES.forEach(({ value: langCode }) => {
    const keys = getAllKeys(translations[langCode]);
    
    keys.forEach(key => {
      const value = getValueByPath(translations[langCode], key);
      if (typeof value === 'string' && value.trim() === '') {
        results.success = false;
        results.emptyValues.push({
          language: langCode,
          key
        });
      }
    });
  });
  
  return results;
};

/**
 * 运行所有验证
 */
export const runAllValidations = () => {
  console.log('🔍 开始验证i18n翻译...\n');
  
  // 1. 验证键结构
  console.log('1️⃣ 检查翻译键结构...');
  const keysResult = validateTranslationKeys();
  if (keysResult.success) {
    console.log('✅ 所有语言的键结构一致\n');
  } else {
    console.error('❌ 发现键结构不一致:');
    keysResult.errors.forEach(error => {
      console.error(`  语言: ${error.language}`);
      console.error(`  缺失的键: ${error.keys.join(', ')}\n`);
    });
  }
  
  if (keysResult.warnings.length > 0) {
    console.warn('⚠️ 发现多余的键:');
    keysResult.warnings.forEach(warning => {
      console.warn(`  语言: ${warning.language}`);
      console.warn(`  多余的键: ${warning.keys.join(', ')}\n`);
    });
  }
  
  // 2. 验证参数一致性
  console.log('2️⃣ 检查参数占位符...');
  const paramsResult = validateParameters();
  if (paramsResult.success) {
    console.log('✅ 所有翻译的参数占位符一致\n');
  } else {
    console.error('❌ 发现参数不一致:');
    paramsResult.inconsistencies.forEach(issue => {
      console.error(`  键: ${issue.key}`);
      console.error(`  基准参数: [${issue.base.join(', ')}]`);
      console.error(`  差异:`, issue.differences);
      console.error('');
    });
  }
  
  // 3. 验证空值
  console.log('3️⃣ 检查空翻译值...');
  const emptyResult = validateEmptyValues();
  if (emptyResult.success) {
    console.log('✅ 没有空的翻译值\n');
  } else {
    console.error('❌ 发现空的翻译值:');
    emptyResult.emptyValues.forEach(empty => {
      console.error(`  语言: ${empty.language}, 键: ${empty.key}`);
    });
    console.error('');
  }
  
  // 总结
  const allSuccess = keysResult.success && paramsResult.success && emptyResult.success;
  console.log('==========================================');
  if (allSuccess) {
    console.log('✅ 所有验证通过！i18n系统完整且一致。');
  } else {
    console.log('❌ 验证失败，请修复上述问题。');
  }
  console.log('==========================================\n');
  
  return {
    success: allSuccess,
    details: {
      keys: keysResult,
      parameters: paramsResult,
      emptyValues: emptyResult
    }
  };
};

// 如果直接运行此脚本
if (typeof window === 'undefined') {
  runAllValidations();
}
