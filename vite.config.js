import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/', // 确保部署后路径正确
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom', 'zustand'],
          'ui-vendor': ['lucide-react', 'framer-motion', 'clsx', 'tailwind-merge'],
          'markdown-vendor': ['react-markdown', 'rehype-katex', 'rehype-raw', 'remark-gfm', 'remark-math', 'katex', 'highlight.js'],
          'pdf-vendor': ['pdfjs-dist'],
          'office-vendor': ['mammoth', 'xlsx', 'jszip'],
          'mermaid-vendor': ['mermaid'],
          'db-vendor': ['dexie', 'dexie-react-hooks']
        }
      }
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})
