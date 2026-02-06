/**
 * 附件预览区域组件
 * 负责展示待发送的图片缩略图及已上传/解析中的文档列表，并提供移除功能。
 */

import React from 'react';
import { X, FileText } from 'lucide-react';

/**
 * 附件显示区组件
 * @param {object} props - 组件属性
 * @param {Array} props.pendingImages - 待发送图片列表
 * @param {Array} props.uploadedFiles - 已上传文件列表
 * @param {Function} props.onRemoveImage - 移除图片回调
 * @param {Function} props.onRemoveFile - 移除文件回调
 * @param {Function} props.onPreviewImage - 预览图片回调
 */
const AttachmentArea = ({ 
  pendingImages, 
  uploadedFiles, 
  onRemoveImage, 
  onRemoveFile, 
  onPreviewImage 
}) => {
  if (pendingImages.length === 0 && uploadedFiles.length === 0) return null;

  return (
    <div className="flex gap-2 px-4 py-2 overflow-x-auto custom-scrollbar">
      {pendingImages.map((img) => (
        <div key={img.id} className="relative group flex-shrink-0 mt-1">
          <img 
            src={img.data} 
            alt="preview" 
            className="h-16 w-16 object-cover rounded-lg border border-border cursor-pointer hover:opacity-90 transition-opacity" 
            onClick={() => onPreviewImage(img.data)}
          />
          <button 
            onClick={() => onRemoveImage(img.id)}
            className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
      
      {uploadedFiles.map((file) => (
        <div key={file.id} className="relative group flex-shrink-0 w-40 h-16 flex items-center gap-2 bg-accent/30 rounded-lg border border-border p-2 pr-6">
          <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-background rounded border">
            <FileText className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <span className="text-xs font-medium truncate w-full" title={file.name}>{file.name}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-tighter">
              {file.status}
            </span>
          </div>
          <button 
            onClick={() => onRemoveFile(file.id)}
            className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
          >
            <X className="w-3 h-3" />
          </button>
          
          {(file.status === 'uploading' || file.status === 'parsing') && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-accent rounded-b-lg overflow-hidden">
               <div 
                 className="h-full bg-primary transition-all duration-300" 
                 style={{ width: `${file.progress || 0}%` }} 
               />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AttachmentArea;