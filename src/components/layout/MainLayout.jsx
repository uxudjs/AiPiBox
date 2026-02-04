import React, { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { cn } from '../../utils/cn';
import { useUIStore } from '../../store/useViewStore';
import LoadingFallback from '../ui/LoadingFallback';

/**
 * 应用主容器组件
 * 负责整体布局结构、路由出口管理及视图切换动画
 */
const MainLayout = () => {
  const location = useLocation();
  
  // 精确订阅 UI 状态，避免不必要的重渲染
  const sidebarCollapsed = useUIStore(state => state.sidebarCollapsed);
  const mobileSidebarOpen = useUIStore(state => state.mobileSidebarOpen);
  const setMobileSidebarOpen = useUIStore(state => state.setMobileSidebarOpen);
  const setView = useUIStore(state => state.setView);

  // 同步路由状态到 currentView 以驱动旧有的副作用逻辑判断
  React.useEffect(() => {
    try {
      const path = location.pathname;
      const view = path.startsWith('/image') ? 'image-factory' : 
                   path.startsWith('/published') ? 'published' : 'chat';
      
      // 使用更稳定的方式获取当前状态，避免依赖不一致
      const currentViewInStore = useUIStore.getState().currentView;
      if (currentViewInStore !== view) {
        setView(view);
      }
    } catch (err) {
      logger.error('MainLayout', 'Error syncing view state', err);
    }
  }, [location.pathname, setView]);

  return (
    <div className="flex h-full w-full overflow-hidden bg-background text-foreground">
      {/* 侧边栏：集成移动端与桌面端状态控制 */}
      <Sidebar 
        isOpen={mobileSidebarOpen} 
        onClose={() => setMobileSidebarOpen(false)} 
      />
      
      <div className={cn(
        "flex flex-1 flex-col overflow-hidden transition-all duration-300",
        sidebarCollapsed ? "lg:ml-0" : "" // 如果 Sidebar 是 static 的，这里需要对应调整
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
