import { useState, useMemo, useCallback } from 'react';
import { useFileStore } from '../../../store/useFileStore';
import { compressImage } from '../../../utils/imageCompression';
import { logger } from '../../../services/logger';
import { CHAT_CONFIG } from '../../../utils/constants';
import { useTranslation } from '../../../i18n';

/**
 * 常见图片格式魔术字节签名
 */
const IMAGE_MAGIC_BYTES = {
  png:  { offset: 0, bytes: [0x89, 0x50, 0x4E, 0x47] },
  jpeg: { offset: 0, bytes: [0xFF, 0xD8, 0xFF] },
  gif:  { offset: 0, bytes: [0x47, 0x49, 0x46, 0x38] },
  webp: { offset: 0, bytes: [0x52, 0x49, 0x46, 0x46] },
};

/**
 * 检测文件魔术字节是否匹配预期图片格式
 * @param {File} file
 * @returns {Promise<boolean>}
 */
async function validateImageMagicBytes(file) {
  if (!file.type.startsWith('image/')) return false;

  const ext = file.name.split('.').pop()?.toLowerCase();
  const signature = IMAGE_MAGIC_BYTES[ext] || IMAGE_MAGIC_BYTES.jpeg;
  const slice = file.slice(signature.offset, signature.offset + signature.bytes.length);

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const arr = new Uint8Array(reader.result);
      resolve(signature.bytes.every((b, i) => arr[i] === b));
    };
    reader.onerror = () => resolve(false);
    reader.readAsArrayBuffer(slice);
  });
}

/**
 * SVG 文件基础安全检查，防止嵌入脚本或事件处理器
 * @param {string} text - SVG 文本内容
 * @returns {boolean} 是否安全
 */
function isSvgSafe(text) {
  const dangerous = /<script[\s>]|on\w+\s*=|javascript:|<use\b.*\bxlink:href\s*=\s*["'](?!data:)/i;
  return !dangerous.test(text);
}

/**
 * 读取文件文本内容
 * @param {File} file
 * @returns {Promise<string>}
 */
function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * useFileHandler Hook
 * 集中管理文件选择、图片压缩、拖拽上传及粘贴上传逻辑
 */
export const useFileHandler = (currentConversationId) => {
  const { t } = useTranslation();
  const [pendingImages, setPendingImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  
  const { 
    addFile, 
    getFilesByConversation, 
    removeFile, 
    attachFilesToMessage 
  } = useFileStore();

  // 获取当前对话的未关联文档
  const uploadedFiles = getFilesByConversation(currentConversationId || 'temp').filter(f => !f.messageId);

  // 检查所有文件是否都已解析完成
  const isFilesReady = useMemo(() => {
    return uploadedFiles.every(f => f.status === 'completed');
  }, [uploadedFiles]);

  /**
   * 筛选并校验图片文件：检查 MIME 类型 + 魔术字节，SVG 额外检查内容安全
   */
  const filterAndValidateImages = useCallback(async (files) => {
    const valid = [];
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;

      // SVG 文件检测危险内容
      if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
        try {
          const text = await readFileAsText(file);
          if (!isSvgSafe(text)) {
            logger.warn('useFileHandler', 'Rejected unsafe SVG file:', file.name);
            alert(`${t('inputArea.error')}: ${file.name} - SVG contains unsafe content`);
            continue;
          }
        } catch {
          logger.warn('useFileHandler', 'Failed to read SVG file:', file.name);
          continue;
        }
        valid.push(file);
        continue;
      }

      // 位图文件检测魔术字节
      const isValid = await validateImageMagicBytes(file);
      if (isValid) {
        valid.push(file);
      } else {
        logger.warn('useFileHandler', 'Rejected file with invalid signature:', file.name, file.type);
        alert(`${t('inputArea.error')}: ${file.name} - File type does not match its content`);
      }
    }
    return valid;
  }, [t]);

  /**
   * 处理图片文件压缩与暂存
   */
  const processImageFiles = useCallback(async (files) => {
    const results = [];
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      
      try {
        const compressedDataUrl = await compressImage(file, {
          maxWidth: CHAT_CONFIG.IMAGE_MAX_SIZE,
          maxHeight: CHAT_CONFIG.IMAGE_MAX_SIZE,
          quality: CHAT_CONFIG.IMAGE_QUALITY
        });

        results.push({
          id: `${Date.now()}_${crypto.randomUUID()}`,
          data: compressedDataUrl,
          file
        });
      } catch (err) {
        logger.error('useFileHandler', 'Failed to process image file', err);
        alert(`${t('inputArea.error')}: ${err.message || 'Image processing failed'}`);
      }
    }
    setPendingImages(prev => [...prev, ...results]);
  }, [t]);

  /**
   * 处理文件/图片选择
   */
  const handleFileSelect = useCallback(async (e, fileInputRef) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const imageCandidates = files.filter(f => f.type.startsWith('image/'));
    const docFiles = files.filter(f => !f.type.startsWith('image/'));

    if (imageCandidates.length > 0) {
      const validImages = await filterAndValidateImages(imageCandidates);
      if (validImages.length > 0) await processImageFiles(validImages);
    }
    
    if (docFiles.length > 0) {
      const targetConvId = currentConversationId || 'temp';
      for (const file of docFiles) {
        try {
          await addFile(file, targetConvId);
        } catch (err) {
          logger.error('useFileHandler', 'Failed to add file:', file.name, err);
          alert(`${t('inputArea.error')}: ${file.name} - ${err.message}`);
        }
      }
    }
    
    if (fileInputRef?.current) fileInputRef.current.value = '';
  }, [currentConversationId, addFile, processImageFiles, filterAndValidateImages, t]);

  /**
   * 处理剪贴板粘贴
   */
  const handlePaste = useCallback((e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const imageFiles = [];
    const docFiles = [];
    
    for (const item of items) {
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file) {
           if (file.type.startsWith('image/')) {
             imageFiles.push(file);
           } else {
             docFiles.push(file);
           }
        }
      }
    }

    if (imageFiles.length > 0) {
      e.preventDefault();
      processImageFiles(imageFiles);
    }
    
    if (docFiles.length > 0) {
       e.preventDefault();
       const targetConvId = currentConversationId || 'temp';
       docFiles.forEach(file => addFile(file, targetConvId));
    }
  }, [currentConversationId, addFile, processImageFiles]);

  /**
   * 拖拽交互处理
   */
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);
  
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    const docFiles = files.filter(f => !f.type.startsWith('image/'));

    if (imageFiles.length > 0) processImageFiles(imageFiles);
    
    if (docFiles.length > 0) {
       const targetConvId = currentConversationId || 'temp';
       docFiles.forEach(file => addFile(file, targetConvId));
    }
  }, [currentConversationId, addFile, processImageFiles]);

  const removePendingImage = useCallback((id) => {
    setPendingImages(prev => prev.filter(img => img.id !== id));
  }, []);

  const clearPendingImages = useCallback(() => {
    setPendingImages([]);
  }, []);

  return {
    pendingImages,
    setPendingImages,
    uploadedFiles,
    isFilesReady,
    isDragging,
    handleFileSelect,
    handlePaste,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    removePendingImage,
    clearPendingImages,
    removeFile,
    attachFilesToMessage
  };
};
