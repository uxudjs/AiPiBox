import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * UI 状态 Store (原 useViewStore)
 * 负责管理侧边栏折叠状态、当前视图等 UI 相关的持久化配置
 */
export const useUIStore = create(
  persist(
    (set) => ({
      // 侧边栏是否折叠（桌面端）
      sidebarCollapsed: false,
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      
      // 移动端侧边栏是否开启
      mobileSidebarOpen: false,
      setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
      
      // 当前视图（保留用于某些逻辑判断，虽然路由已接管主要导航）
      currentView: 'chat',
      setView: (view) => set({ currentView: view }),
    }),
    {
      name: 'aipibox-ui-storage',
      partialize: (state) => ({ 
        sidebarCollapsed: state.sidebarCollapsed 
      }),
    }
  )
);

// 为保持向后兼容，导出旧名称
export const useViewStore = useUIStore;
