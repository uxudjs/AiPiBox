/**
 * 模型名称与能力推断工具
 * 自动将模型 ID 转换为可读名称，并根据命名模式推断其功能特性。
 */

/**
 * 从模型 ID 推断显示名称
 * @param {string} modelId - 模型标识符
 * @param {string} [providerId] - 服务商标识（可选）
 * @returns {string} 格式化后的显示名称
 */
export function inferModelDisplayName(modelId, providerId = '') {
  if (!modelId) return '';
  return formatModelIdAsDisplayName(String(modelId).trim());
}

/**
 * 将模型 ID 格式化为标题格式名称
 * @param {string} modelId - 原始 ID
 * @returns {string} 格式化后的名称
 */
function formatModelIdAsDisplayName(modelId) {
  if (!modelId) return '';

  let name = String(modelId).trim();

  name = name.replace(/^(models\/|text-|chat-)/i, '');

  name = name.replace(/(\d)-(\d)/g, '$1.$2');

  const parts = name.split(/[-_]/);

  const formatted = parts.map(part => {
    if (!part) return '';
    return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
  });

  return formatted.join(' ');
}

/**
 * 推断模型的功能特性（如多模态、思考能力等）
 * @param {string} modelId - 模型标识符
 * @returns {object} 能力标识对象
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
    thinking: id.includes('thinking') || 
              id.includes('reasoner') || 
              id.includes('r1') || 
              id.includes('o1') || 
              id.includes('o3') ||
              (id.includes('gemini') && (/-[2-9]\./.test(id) || /-exp/.test(id)) && id.includes('thinking')),

    multimodal: id.includes('vision') || 
                id.includes('vl') || 
                id.includes('claude-3') || 
                id.includes('gpt-4o') || 
                id.includes('gemini') ||
                id.includes('qwen-vl') ||
                id.includes('llama-3.2-90b') ||
                id.includes('llama-3.2-11b'),

    imageGen: id.includes('dall-e') || 
              id.includes('stable-diffusion') || 
              id.includes('flux') || 
              id.includes('midjourney') || 
              id.includes('sdxl') ||
              id.includes('sd-') ||
              id.includes('kolors'),

    tools: true,
  };
}

export default {
  inferModelDisplayName,
  inferModelCapabilities,
  formatModelIdAsDisplayName,
};