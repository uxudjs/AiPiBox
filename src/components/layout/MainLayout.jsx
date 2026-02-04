import React, { useState, Suspense, lazy } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { cn } from '../../utils/cn';
import { useViewStore } from '../../store/useViewStore';
import { Loader2 } from 'lucide-react';

// 懒加载图片工厂组件
const ImageFactory = lazy(() => import('../image/ImageFactory'));

/**
 * 应用主容器组件
 * 构建响应式框架，管理侧边栏显隐逻辑并根据路由（ViewStore）动态调度主视图与图片工厂视图
 */
const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const currentView = useViewStore(state => state.currentView);

  return (
    <div className="flex h-full w-full overflow-hidden bg-background text-foreground">
      {/* Sidebar for desktop and mobile */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-hidden relative">
          {currentView === 'image-factory' ? (
            <Suspense fallback={
              <div className="h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            }>
              <ImageFactory />
            </Suspense>
          ) : children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
