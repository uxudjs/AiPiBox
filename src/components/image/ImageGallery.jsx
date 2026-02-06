/**
 * 图像库展示组件
 * 以网格形式展示历史生成的图像，支持单张详情查看、多选批量删除及清空历史。
 */

import React, { useState } from 'react';
import { useTranslation } from '../../i18n';
import { useImageGenStore } from '../../store/useImageGenStore';
import { cn } from '../../utils/cn';
import { 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Maximize2
} from 'lucide-react';
import ImageDetailModal from './ImageDetailModal';

/**
 * 图像画廊组件
 */
const ImageGallery = () => {
  const { t } = useTranslation();
  const { 
    history, 
    deleteBatchImages, 
    clearAllHistory,
    selectedImage,
    setSelectedImage
  } = useImageGenStore();
  
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  /**
   * 切换单张图片的选中状态
   * @param {string} id - 图像 ID
   * @param {Event} e - 点击事件
   */
  const toggleSelect = (id, e) => {
    e.stopPropagation();
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  /**
   * 执行批量删除操作
   */
  const handleBatchDelete = () => {
    if (confirm(t('imageFactory.deleteConfirm', { count: selectedIds.length }))) {
      deleteBatchImages(selectedIds);
      setSelectedIds([]);
      setIsMultiSelect(false);
    }
  };

  if (history.length === 0) {
    return (
      <div className="py-20 text-center bg-accent/10 rounded-3xl border-2 border-dashed border-accent/30">
        <div className="text-muted-foreground text-sm font-medium">
          {t('imageFactory.noHistory')}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex gap-2">
          <button
            onClick={() => {
              setIsMultiSelect(!isMultiSelect);
              setSelectedIds([]);
            }}
            className={cn(
              "text-xs font-bold px-3 py-1.5 rounded-lg transition-all",
              isMultiSelect ? "bg-primary text-primary-foreground" : "bg-accent/50 text-muted-foreground hover:bg-accent"
            )}
          >
            {isMultiSelect ? t('common.cancel') : t('common.select')}
          </button>
          {isMultiSelect && selectedIds.length > 0 && (
            <button
              onClick={handleBatchDelete}
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {t('common.delete')} ({selectedIds.length})
            </button>
          )}
        </div>
        {history.length > 0 && !isMultiSelect && (
          <button
            onClick={() => {
              if (confirm(t('imageFactory.clearAllConfirm'))) clearAllHistory();
            }}
            className="text-xs font-bold text-muted-foreground hover:text-destructive transition-colors"
          >
            {t('common.clear')}
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {history.map((img) => (
          <div 
            key={img.id}
            className={cn(
              "group relative aspect-square rounded-2xl overflow-hidden bg-accent/20 cursor-pointer border-2 transition-all",
              selectedIds.includes(img.id) ? "border-primary" : "border-transparent hover:border-primary/30"
            )}
            onClick={() => isMultiSelect ? toggleSelect(img.id, { stopPropagation: () => {} }) : setSelectedImage(img)}
          >
            <img 
              src={img.imageUrl} 
              alt={img.prompt}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            {isMultiSelect && (
              <div className="absolute top-2 left-2">
                {selectedIds.includes(img.id) ? (
                  <CheckCircle2 className="w-6 h-6 text-primary fill-white" />
                ) : (
                  <Circle className="w-6 h-6 text-white/50" />
                )}
              </div>
            )}

            {!isMultiSelect && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white">
                  <Maximize2 className="w-5 h-5" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedImage && (
        <ImageDetailModal 
          image={selectedImage} 
          onClose={() => setSelectedImage(null)} 
        />
      )}
    </div>
  );
};

export default ImageGallery;