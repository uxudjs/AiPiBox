import React, { useRef, useState } from 'react';
import { Upload, X, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useFileStore } from '../../store/useFileStore';
import { SUPPORTED_TYPES } from '../../services/documentParser';
import { logger } from '../../services/logger';
import { useTranslation } from '../../i18n';

/**
 * 文件上传组件
 * 支持点击上传和拖拽上传文档，显示上传进度
 * @param {Object} props
 * @param {string} props.conversationId - 当前对话ID
 * @param {Function} props.onFileUploaded - 文件上传完成回调
 */
const FileUpload = ({ conversationId, onFileUploaded }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const { addFile, uploadedFiles, removeFile, getFilesByConversation } = useFileStore();
  
  // 获取当前对话的文件列表
  const currentFiles = getFilesByConversation(conversationId);
  
  /**
   * 处理文件选择
   * 支持多文件上传
   */
  const handleFileSelect = async (files) => {
    if (!files || files.length === 0) return;
    
    for (const file of Array.from(files)) {
      try {
        await addFile(file, conversationId);
        if (onFileUploaded) onFileUploaded(file);
      } catch (error) {
        logger.error('FileUpload', 'File upload failed:', error);
        alert(`${t('fileUpload.failed')}${error.message}`);
      }
    }
  };
  
  // 点击上传按钮
  const handleClick = () => {
    fileInputRef.current?.click();
  };
  
  // 拖拽进入时显示高亮效果
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  // 拖拽离开时移除高亮
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  // 放下文件时处理上传
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };
  
  // 获取文件图标
  const getFileIcon = (file) => {
    for (const [type, config] of Object.entries(SUPPORTED_TYPES)) {
      if (config.mimeTypes.includes(file.type)) {
        return config.icon;
      }
    }
    return '📎';
  };
  
  // 获取状态图标
  const getStatusIcon = (status) => {
    switch (status) {
      case 'uploading':
      case 'parsing':
        return <Loader2 className="w-4 h-4 animate-spin text-primary" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-2">
      {/* 上传区域 */}
      <div
        className={cn(
          "border-2 border-dashed rounded-xl p-4 transition-all cursor-pointer",
          isDragging 
            ? "border-primary bg-primary/5" 
            : "border-border hover:border-primary/50 hover:bg-accent/20"
        )}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.md"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Upload className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">
              {isDragging ? t('fileUpload.dropHint') : t('fileUpload.clickHint')}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t('fileUpload.supportHint')}
            </p>
          </div>
        </div>
      </div>
      
      {/* 已上传文件列表 */}
      {currentFiles.length > 0 && (
        <div className="space-y-2">
          {currentFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/20 transition-colors"
            >
              {/* 文件图标 */}
              <div className="text-2xl">{getFileIcon(file)}</div>
              
              {/* 文件信息 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  {getStatusIcon(file.status)}
                </div>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  <span>{(file.size / 1024).toFixed(2)} KB</span>
                  {file.status === 'parsing' && file.progress > 0 && (
                    <span>• {t('fileUpload.parsing')} {file.progress}%</span>
                  )}
                  {file.status === 'completed' && (
                    <span className="text-green-500">• {t('fileUpload.completed')}</span>
                  )}
                  {file.status === 'error' && (
                    <span className="text-destructive">• {file.error}</span>
                  )}
                </div>
                
                {/* 进度条 */}
                {(file.status === 'uploading' || file.status === 'parsing') && (
                  <div className="mt-2 w-full h-1 bg-accent rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                )}
              </div>
              
              {/* 删除按钮 */}
              <button
                onClick={() => removeFile(file.id)}
                className="p-1 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"
                title={t('fileUpload.deleteFile')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
