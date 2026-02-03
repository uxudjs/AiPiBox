import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/**
 * 图片预览模态框组件
 * @param {Object} props
 * @param {string} props.src - 图片地址
 * @param {Function} props.onClose - 关闭回调
 */
const ImagePreviewModal = ({ src, onClose }) => {
  if (!src) return null;
  
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={onClose}>
      <button className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors" onClick={onClose}>
        <X className="w-8 h-8" />
      </button>
      <img src={src} alt="preview" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />
    </div>,
    document.body
  );
};

export default ImagePreviewModal;
