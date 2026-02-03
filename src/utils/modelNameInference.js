/**
 * Model Display Name Inference Utility
 * Automatically converts model IDs to human-readable display names
 * 
 * 模型显示名称推断工具
 * 自动将模型ID转换为人类可读的显示名称
 */

/**
 * Infer display name from model ID
 * 从模型ID推断显示名称
 * 
 * @param {string} modelId - The model identifier (e.g., 'gpt-4o', 'claude-3-5-sonnet', 'qwen3-max-preview')
 * @param {string} providerId - The provider identifier (optional, not used in current implementation)
 * @returns {string} - User-friendly display name
 */
export function inferModelDisplayName(modelId, providerId = '') {
  if (!modelId) return '';
  return formatModelIdAsDisplayName(String(modelId).trim());
}

/**
 * Format model ID into a readable display name
 * 将模型ID格式化为可读的显示名称
 * 
 * Rules (规则):
 * 1. Remove common prefixes like 'models/', 'text-', 'chat-'
 *    移除常见前缀如 'models/', 'text-', 'chat-'
 * 2. Replace hyphens between digits with dots (e.g., '3-5' -> '3.5')
 *    将数字之间的连字符替换为点号 (如 '3-5' -> '3.5')
 * 3. Replace remaining hyphens with spaces and capitalize the letter after each hyphen
 *    将剩余连字符替换为空格，并将连字符后的字母大写
 * 4. Capitalize the first letter of each word (Title Case)
 *    每个单词首字母大写(标题格式)
 * 5. Keep numbers unchanged, only transform letters
 *    保持数字不变，仅转换字母
 * 
 * Examples (示例):
 * - 'qwen3-max-preview' -> 'Qwen3 Max Preview'
 * - 'gpt-4o-mini' -> 'Gpt 4o Mini'
 * - 'claude-3-5-sonnet' -> 'Claude 3.5 Sonnet'
 * - 'gemini-2-5-pro' -> 'Gemini 2.5 Pro'
 * - 'gpt-4-32k' -> 'Gpt 4.32k'
 * - 'qwen2-5-max' -> 'Qwen2.5 Max'
 * 
 * @param {string} modelId - The model identifier
 * @returns {string} - Formatted display name
 */
function formatModelIdAsDisplayName(modelId) {
  if (!modelId) return '';

  let name = String(modelId).trim();

  // Step 1: Remove common prefixes
  name = name.replace(/^(models\/|text-|chat-)/i, '');

  // Step 2: Replace hyphens between digits with dots
  // Match pattern: digit + hyphen + digit -> digit + dot + digit
  name = name.replace(/(\d)-(\d)/g, '$1.$2');

  // Step 3: Split by hyphens and underscores
  const parts = name.split(/[-_]/);

  // Step 4: Capitalize first letter of each part (Title Case)
  const formatted = parts.map(part => {
    if (!part) return '';
    // Capitalize first letter, keep rest as-is (preserving numbers and dots)
    return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
  });

  // Step 5: Join with spaces
  return formatted.join(' ');
}

/**
 * Check if a model ID matches known patterns for a specific capability
 * 检查模型ID是否匹配特定能力的已知模式
 */
export function inferModelCapabilities(modelId) {
  if (!modelId) {
    return {
      thinking: false,
      multimodal: false,
      tools: true,
      imageGen: false,
    };
  }

  const id = String(modelId).toLowerCase();

  return {
    // Thinking/reasoning capabilities
    thinking: id.includes('thinking') || 
              id.includes('reasoner') || 
              id.includes('r1') || 
              id.includes('o1') || 
              id.includes('o3') ||
              // 自动兼容 Gemini 2.0, 3, 4... 等未来版本
              (id.includes('gemini') && (/-[2-9]\./.test(id) || /-exp/.test(id)) && id.includes('thinking')),

    // Multimodal capabilities (vision, image understanding)
    multimodal: id.includes('vision') || 
                id.includes('vl') || 
                id.includes('claude-3') || 
                id.includes('gpt-4o') || 
                id.includes('gemini') ||
                id.includes('qwen-vl') ||
                id.includes('llama-3.2-90b') ||
                id.includes('llama-3.2-11b'),

    // Image generation capabilities
    imageGen: id.includes('dall-e') || 
              id.includes('stable-diffusion') || 
              id.includes('flux') || 
              id.includes('midjourney') || 
              id.includes('sdxl') ||
              id.includes('sd-') ||
              id.includes('kolors'),

    // Tool/function calling support (most modern models support this)
    tools: true,
  };
}

export default {
  inferModelDisplayName,
  inferModelCapabilities,
  formatModelIdAsDisplayName,
};
