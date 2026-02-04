import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { recordDeletion } from '../db';

/**
 * 知识库 Store
 * 负责本地 RAG（检索增强生成）相关状态管理
 * 包括文档分块存储与简易关键词检索逻辑
 */

const useKnowledgeBaseStore = create(
  persist(
    (set, get) => ({
      // 知识库实体列表
      knowledgeBases: [],
      
      // 当前工作对话中挂载的知识库 ID
      activeKnowledgeBase: null,
      
      // RAG 检索策略参数
      retrievalSettings: {
        topK: 3,                  // 召回相关分块的最大数量
        similarityThreshold: 0.7, // 相似度阈值
        maxTokens: 2000           // 注入上下文的消息最大长度
      },
      
      /**
       * 新建知识库实例
       * @param {string} name 知识库名称
       * @param {string} description 描述说明
       * @returns {string} 唯一标识 ID
       */
      createKnowledgeBase: (name, description) => {
        const newKB = {
          id: `kb-${Date.now()}`,
          name: name || '未命名知识库',
          description: description || '',
          documents: [],
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        
        set((state) => ({
          knowledgeBases: [...state.knowledgeBases, newKB]
        }));
        
        return newKB.id;
      },
      
      /**
       * 更新知识库元数据
       */
      updateKnowledgeBase: (kbId, updates) => {
        set((state) => ({
          knowledgeBases: state.knowledgeBases.map(kb =>
            kb.id === kbId
              ? { ...kb, ...updates, updatedAt: Date.now() }
              : kb
          )
        }));
      },
      
      /**
       * 移除知识库及其关联文档
       */
      deleteKnowledgeBase: async (kbId) => {
        await recordDeletion('knowledgeBases', kbId);
        set((state) => ({
          knowledgeBases: state.knowledgeBases.filter(kb => kb.id !== kbId),
          activeKnowledgeBase: state.activeKnowledgeBase === kbId ? null : state.activeKnowledgeBase
        }));
      },
      
      /**
       * 导入文档并自动切片
       * 目前采用基于字符长度的固定窗口切片策略
       */
      addDocument: (kbId, document) => {
        const newDoc = {
          id: `doc-${Date.now()}`,
          name: document.name,
          content: document.content,
          type: document.type || 'text', // 文档类型：text | pdf | markdown
          size: document.content.length,
          chunks: [], // 文档分块后的内容数组
          metadata: document.metadata || {},
          addedAt: Date.now()
        };
        
        // 简单的文档分块逻辑：按固定字符数分块
        const chunkSize = 500; // 每块500字符
        const chunks = [];
        for (let i = 0; i < document.content.length; i += chunkSize) {
          chunks.push({
            id: `chunk-${Date.now()}-${i}`,
            content: document.content.slice(i, i + chunkSize),
            startIndex: i,
            endIndex: Math.min(i + chunkSize, document.content.length)
          });
        }
        newDoc.chunks = chunks;
        
        set((state) => ({
          knowledgeBases: state.knowledgeBases.map(kb =>
            kb.id === kbId
              ? { 
                  ...kb, 
                  documents: [...kb.documents, newDoc],
                  updatedAt: Date.now()
                }
              : kb
          )
        }));
        
        return newDoc.id;
      },
      
      // 删除文档
      deleteDocument: (kbId, docId) => {
        set((state) => ({
          knowledgeBases: state.knowledgeBases.map(kb =>
            kb.id === kbId
              ? { 
                  ...kb, 
                  documents: kb.documents.filter(doc => doc.id !== docId),
                  updatedAt: Date.now()
                }
              : kb
          )
        }));
      },
      
      // 设置激活的知识库
      setActiveKnowledgeBase: (kbId) => {
        set({ activeKnowledgeBase: kbId });
      },
      
      // 更新检索设置
      updateRetrievalSettings: (settings) => {
        set((state) => ({
          retrievalSettings: { ...state.retrievalSettings, ...settings }
        }));
      },
      
      /**
       * 执行本地全文检索
       * 实现了一套轻量级的关键词词频打分算法（简易版 TF-IDF）
       */
      retrieveDocuments: (query, kbId) => {
        const state = get();
        const kb = state.knowledgeBases.find(kb => kb.id === kbId);
        
        if (!kb) return [];
        
        // 提取检索词并过滤超短词
        const queryKeywords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
        
        const scoredChunks = [];
        kb.documents.forEach(doc => {
          doc.chunks.forEach(chunk => {
            const content = chunk.content.toLowerCase();
            let score = 0;
            
            // 计算各关键词在分块内容中的匹配次数
            queryKeywords.forEach(keyword => {
              const count = (content.match(new RegExp(keyword, 'g')) || []).length;
              score += count;
            });
            
            if (score > 0) {
              scoredChunks.push({
                documentId: doc.id,
                documentName: doc.name,
                chunkId: chunk.id,
                content: chunk.content,
                score: score,
                similarity: Math.min(score / 10, 1) // 归一化得分
              });
            }
          });
        });
        
        // 按分数排序，取Top-K
        const topChunks = scoredChunks
          .sort((a, b) => b.score - a.score)
          .filter(chunk => chunk.similarity >= state.retrievalSettings.similarityThreshold)
          .slice(0, state.retrievalSettings.topK);
        
        return topChunks;
      },
      
      // 获取知识库统计信息
      getKnowledgeBaseStats: (kbId) => {
        const state = get();
        const kb = state.knowledgeBases.find(kb => kb.id === kbId);
        
        if (!kb) return null;
        
        const totalDocuments = kb.documents.length;
        const totalChunks = kb.documents.reduce((sum, doc) => sum + doc.chunks.length, 0);
        const totalSize = kb.documents.reduce((sum, doc) => sum + doc.size, 0);
        
        return {
          totalDocuments,
          totalChunks,
          totalSize,
          formattedSize: formatSize(totalSize)
        };
      }
    }),
    {
      name: 'knowledge-base-storage',
      version: 1
    }
  )
);

/**
 * 辅助函数：字节单位格式化
 */
function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

export { useKnowledgeBaseStore };
