import { create } from 'zustand';
import { parseDocument, formatDocumentForAI } from '../services/documentParser';
import { logger } from '../services/logger';

/**
 * 文件管理状态存储
 * 处理文件上传、解析和与对话的关联
 */
export const useFileStore = create((set, get) => ({
  // 已上传的文件列表
  uploadedFiles: [],
  
  // 当前正在处理的文件
  currentFile: null,
  
  // 文件解析进度信息
  parseProgress: null,
  
  /**
   * 添加文件并开始解析
   * @param {File} file - 要上传的文件对象
   * @param {string} conversationId - 关联的对话ID
   * @throws {Error} 文件解析失败时抛出异常
   */
  addFile: async (file, conversationId) => {
    logger.info('FileStore', 'Adding file:', file.name);
    
    const fileId = `${Date.now()}_${file.name}`;
    
    // 创建文件条目并添加到列表
    const fileEntry = {
      id: fileId,
      file,
      conversationId,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'uploading', // 状态：uploading | parsing | completed | error
      progress: 0,
      parsedContent: null,
      error: null,
      uploadedAt: Date.now()
    };
    
    set(state => ({
      uploadedFiles: [...state.uploadedFiles, fileEntry],
      currentFile: fileEntry
    }));
    
    try {
      // 更新为解析状态
      set(state => ({
        uploadedFiles: state.uploadedFiles.map(f =>
          f.id === fileId ? { ...f, status: 'parsing', progress: 10 } : f
        )
      }));
      
      // 执行文件解析，并实时更新进度
      const parsedDoc = await parseDocument(file, (progressInfo) => {
        set(state => ({
          parseProgress: progressInfo,
          uploadedFiles: state.uploadedFiles.map(f =>
            f.id === fileId ? { ...f, progress: progressInfo.progress } : f
          )
        }));
      });
      
      // 将解析结果格式化为AI可理解的内容
      const formattedContent = formatDocumentForAI(parsedDoc);
      
      // 更新为完成状态
      set(state => ({
        uploadedFiles: state.uploadedFiles.map(f =>
          f.id === fileId ? {
            ...f,
            status: 'completed',
            progress: 100,
            parsedContent: {
              ...parsedDoc,
              formattedForAI: formattedContent
            }
          } : f
        ),
        parseProgress: null,
        currentFile: null
      }));
      
      logger.info('FileStore', 'File parsed successfully:', file.name);
      return fileId;
      
    } catch (error) {
      logger.error('FileStore', 'File parse failed:', error);
      
      set(state => ({
        uploadedFiles: state.uploadedFiles.map(f =>
          f.id === fileId ? {
            ...f,
            status: 'error',
            error: error.message,
            progress: 0
          } : f
        ),
        parseProgress: null,
        currentFile: null
      }));
      
      throw error;
    }
  },
  
  /**
   * 移除文件
   */
  removeFile: (fileId) => {
    logger.info('FileStore', 'Removing file:', fileId);
    set(state => ({
      uploadedFiles: state.uploadedFiles.filter(f => f.id !== fileId)
    }));
  },
  
  /**
   * 获取指定对话的文件
   */
  getFilesByConversation: (conversationId) => {
    return get().uploadedFiles.filter(f => f.conversationId === conversationId);
  },
  
  /**
   * 获取所有已完成解析的文件内容（用于AI上下文）
   */
  getCompletedFilesContent: (conversationId) => {
    const files = get().uploadedFiles.filter(
      f => f.conversationId === conversationId && f.status === 'completed'
    );
    
    if (files.length === 0) return null;
    
    // 组合所有文件内容
    let combined = '=== 已上传的文档 ===\n\n';
    
    files.forEach((file, index) => {
      combined += `文档 ${index + 1}: ${file.name}\n`;
      combined += file.parsedContent.formattedForAI;
      combined += '\n\n';
    });
    
    combined += '=== 文档内容结束 ===\n';
    
    return combined;
  },
  
  /**
   * 清除指定对话的所有文件
   */
  clearConversationFiles: (conversationId) => {
    logger.info('FileStore', 'Clearing files for conversation:', conversationId);
    set(state => ({
      uploadedFiles: state.uploadedFiles.filter(f => f.conversationId !== conversationId)
    }));
  },
  
  /**
   * 清除所有文件
   */
  clearAllFiles: () => {
    logger.info('FileStore', 'Clearing all files');
    set({ uploadedFiles: [], currentFile: null, parseProgress: null });
  },

  /**
   * 更新文件的对话ID (用于将临时文件的归属转移到新创建的对话)
   */
  updateFileConversationId: (oldId, newId) => {
    logger.info('FileStore', `Updating file conversation ID from ${oldId} to ${newId}`);
    set(state => ({
      uploadedFiles: state.uploadedFiles.map(f => 
        f.conversationId === oldId ? { ...f, conversationId: newId } : f
      )
    }));
  },

  /**
   * 将文件关联到特定消息
   */
  attachFilesToMessage: (fileIds, messageId) => {
    logger.info('FileStore', `Attaching ${fileIds.length} files to message ${messageId}`);
    set(state => ({
      uploadedFiles: state.uploadedFiles.map(f => 
        fileIds.includes(f.id) ? { ...f, messageId } : f
      )
    }));
  }
}));
