/**
 * 应用主布局组件
 * 维护整体的页面结构（侧边栏 + 主内容区），并处理路由导航时的视图切换动画及状态同步。
 */

import React, { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { cn } from '../../utils/cn';
import { useUIStore } from '../../store/useViewStore';
import LoadingFallback from '../ui/LoadingFallback';

const MainLayout = () => {
  const location = useLocation();
  
  const sidebarCollapsed = useUIStore(state => state.sidebarCollapsed);
  const mobileSidebarOpen = useUIStore(state => state.mobileSidebarOpen);
  const setMobileSidebarOpen = useUIStore(state => state.setMobileSidebarOpen);
  const setView = useUIStore(state => state.setView);

  /**
   * 路由与视图状态同步
   */
  React.useEffect(() => {
    try {
      const path = location.pathname;
      const view = path.startsWith('/image') ? 'image-factory' : 
                   path.startsWith('/published') ? 'published' : 'chat';
      
      const currentViewInStore = useUIStore.getState().currentView;
      if (currentViewInStore !== view) {
        setView(view);
      }
    } catch (err) {
      console.error('MainLayout view sync error:', err);
    }
  }, [location.pathname, setView]);

  return (
    <div className="flex h-full w-full overflow-hidden bg-background text-foreground">
      <Sidebar 
        isOpen={mobileSidebarOpen} 
        onClose={() => setMobileSidebarOpen(false)} 
      />
      
      <div className={cn(
        "flex flex-1 flex-col overflow-hidden transition-all duration-300",
        sidebarCollapsed ? "lg:ml-0" : ""
      )}>
        <TopBar onMenuClick={() => setMobileSidebarOpen(true)} />
        
        <main className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full w-full"
            >
              <Suspense fallback={<LoadingFallback />}>
                <Outlet />
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;