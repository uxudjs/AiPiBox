import { create } from 'zustand';

export const useViewStore = create((set) => ({
  currentView: 'chat', // 'chat' | 'image-factory'
  setView: (view) => set({ currentView: view }),
}));
