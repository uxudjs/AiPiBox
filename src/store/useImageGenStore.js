import { create } from 'zustand';
import { db } from '../db';
import { logger } from '../services/logger';

export const useImageGenStore = create((set, get) => ({
  // 状态
  mode: 'text-to-image', // 'text-to-image' | 'image-to-image'
  currentModel: {
    providerId: '',
    modelId: ''
  },
  params: {
    prompt: '',
    negativePrompt: '',
    width: 1024,
    height: 1024,
    steps: 20,
    cfgScale: 7.5,
    seed: -1,
    batchSize: 1,
    style: ''
  },
  selectedImage: null, // 用于查看详情的图片
  history: [],
  isGenerating: false,
  error: null,
  
  // 动作
  setMode: (mode) => set({ mode }),
  setCurrentModel: (providerId, modelId) => set({ currentModel: { providerId, modelId } }),
  updateParams: (updates) => set((state) => ({ params: { ...state.params, ...updates } })),
  setSelectedImage: (image) => set({ selectedImage: image }),
  
  // 加载历史记录
  loadHistory: async () => {
    try {
      const history = await db.images.orderBy('timestamp').reverse().toArray();
      set({ history });
    } catch (e) {
      logger.error('ImageGenStore', 'Failed to load history', e);
    }
  },
  
  // 保存图片
  saveImage: async (imageData) => {
    try {
      const id = await db.images.add({
        ...imageData,
        timestamp: Date.now()
      });
      const newImage = await db.images.get(id);
      set((state) => ({ history: [newImage, ...state.history] }));
      return id;
    } catch (e) {
      logger.error('ImageGenStore', 'Failed to save image', e);
      throw e;
    }
  },
  
  // 删除图片
  deleteImage: async (id) => {
    try {
      await db.images.delete(id);
      set((state) => ({ history: state.history.filter(img => img.id !== id) }));
    } catch (e) {
      logger.error('ImageGenStore', 'Failed to delete image', e);
    }
  },
  
  // 批量删除图片
  deleteBatchImages: async (ids) => {
    try {
      await db.images.bulkDelete(ids);
      set((state) => ({ history: state.history.filter(img => !ids.includes(img.id)) }));
    } catch (e) {
      logger.error('ImageGenStore', 'Failed to delete batch images', e);
    }
  },
  
  // 清空历史
  clearAllHistory: async () => {
    try {
      await db.images.clear();
      set({ history: [] });
    } catch (e) {
      logger.error('ImageGenStore', 'Failed to clear history', e);
    }
  },
  
  setGenerating: (isGenerating) => set({ isGenerating }),
  setError: (error) => set({ error })
}));
