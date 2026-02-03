import React from 'react';
import { useTranslation } from '../../i18n';
import { useImageGenStore } from '../../store/useImageGenStore';
import { 
  X, 
  Download, 
  Trash2, 
  Info,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { cn } from '../../utils/cn';

const ImageDetailModal = ({ image, onClose }) => {
  const { t } = useTranslation();
  const { deleteImage } = useImageGenStore();
  const [copied, setCopied] = React.useState(false);

  if (!image) return null;

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(image.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = image.imageUrl;
    link.download = `aipibox-${Date.now()}.png`;
    link.click();
  };

  const handleDelete = () => {
    if (confirm(t('common.deleteConfirm'))) {
      deleteImage(image.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4 lg:p-10 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose} />
      
      <div className="relative w-full max-w-6xl max-h-full bg-card rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row animate-in zoom-in-95 duration-300">
        {/* 关闭按钮 */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* 图片显示区 */}
        <div className="flex-1 bg-black flex items-center justify-center overflow-hidden">
          <img 
            src={image.imageUrl} 
            alt={image.prompt}
            className="max-w-full max-h-full object-contain"
          />
        </div>

        {/* 信息详情区 */}
        <div className="w-full lg:w-96 p-8 overflow-y-auto custom-scrollbar flex flex-col gap-6">
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              {t('imageFactory.prompt')}
            </h3>
            <div className="relative group">
              <p className="text-sm leading-relaxed bg-accent/30 p-4 rounded-2xl italic">
                {image.prompt}
              </p>
              <button 
                onClick={handleCopyPrompt}
                className="absolute top-2 right-2 p-2 bg-card/80 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {image.negativePrompt && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                {t('imageFactory.negativePrompt')}
              </h3>
              <p className="text-sm leading-relaxed bg-destructive/5 text-destructive/70 p-4 rounded-2xl">
                {image.negativePrompt}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-accent/30 rounded-2xl">
              <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">{t('imageFactory.resolution')}</div>
              <div className="text-sm font-mono">{image.width} x {image.height}</div>
            </div>
            <div className="p-3 bg-accent/30 rounded-2xl">
              <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">{t('imageFactory.seed')}</div>
              <div className="text-sm font-mono">{image.seed}</div>
            </div>
            <div className="p-3 bg-accent/30 rounded-2xl">
              <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">{t('imageFactory.steps')}</div>
              <div className="text-sm font-mono">{image.steps}</div>
            </div>
            <div className="p-3 bg-accent/30 rounded-2xl">
              <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">{t('imageFactory.cfgScale')}</div>
              <div className="text-sm font-mono">{image.cfgScale}</div>
            </div>
          </div>

          <div className="mt-auto pt-6 flex gap-3">
            <button 
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-2xl font-bold hover:opacity-90 transition-all active:scale-95"
            >
              <Download className="w-5 h-5" />
              {t('common.download')}
            </button>
            <button 
              onClick={handleDelete}
              className="p-3 bg-destructive/10 text-destructive rounded-2xl hover:bg-destructive/20 transition-all active:scale-95"
            >
              <Trash2 className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageDetailModal;
