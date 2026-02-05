import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * 全局加载回退组件
 * 用于 Suspense 边界，提供统一的加载动画效果
 */
const LoadingFallback = () => {
  return (
    <div className="h-full w-full flex items-center justify-center bg-background/50 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">{t('common.loading')}</p>
      </div>
    </div>
  );
};

export default LoadingFallback;
