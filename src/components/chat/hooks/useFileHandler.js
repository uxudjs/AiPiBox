import { useState, useMemo, useCallback } from 'react';
import { useFileStore } from '../../../store/useFileStore';
import { compressImage } from '../../../utils/imageCompression';
import { logger } from '../../../services/logger';
import { CHAT_CONFIG } from '../../../utils/constants';
import { useTranslation } from '../../../i18n';

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
          id: Date.now() + Math.random(),
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
    
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    const docFiles = files.filter(f => !f.type.startsWith('image/'));
    
    if (imageFiles.length > 0) await processImageFiles(imageFiles);
    
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
  }, [currentConversationId, addFile, processImageFiles, t]);

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
