# 🤖 AiPiBox

<div align="center">

[![简体中文](https://img.shields.io/badge/lang-简体中文-red.svg)](../README.md)
[![English](https://img.shields.io/badge/lang-English-blue.svg)](./README.en.md)
[![日本語](https://img.shields.io/badge/lang-日本語-green.svg)](./README.ja.md)
[![한국어](https://img.shields.io/badge/lang-한국어-blue.svg)](./README.ko.md)

</div>

一個功能強大、注重隱私的現代化 AI 對話助手應用。支持多模型集成、知識庫管理、圖像生成、網頁發布及實時代碼預覽。

## ✨ 核心特性

### 🔐 隱私與安全
- **本地優先存儲** - 所有數據存儲在瀏覽器 IndexedDB 中，由主密碼加密。
- **端到端加密** - API 密鑰和敏感配置採用 Web Crypto API 硬件級加密。
- **可選雲端同步** - 支持加密備份到雲端數據庫（MySQL/PostgreSQL/Cloudflare KV）。
- **無服務器追蹤** - 完全在客戶端運行，保護用戶隱私。

### 💬 智能對話
- **多模型支持** - 支持 OpenAI、Claude、Gemini、Azure、Groq、DeepSeek 等主流模型。
- **自定義提供商** - 支持添加任何兼容 OpenAI API 的服務。
- **消息樹結構** - 支持分支對話，可隨時回溯和探索不同的對話路徑。
- **流式響應** - 實時顯示 AI 回覆內容，支持中斷生成。
- **自動命名** - 智能生成對話標題。
- **上下文管理** - 智能控制對話上下文長度，支持**對話壓縮**。

### 🎨 創作與增強
- **Artifacts 預覽** - 自動渲染 HTML/CSS/JS/Tailwind 代碼塊，支持實時交互預覽。
- **一鍵發布** - 支持將對話內容或代碼片段發布為在線網頁進行分享。
- **圖像生成** - 集成 DALL-E 3/2、Stable Diffusion，支持文生圖、圖生圖及參數微調。
- **聯網搜索** - 集成 Tavily、Google、Bing 搜索引擎，獲取實時信息。

### 📚 知識庫與處理
- **本地處理** - 文檔（PDF/Word/Excel/PPT/TXT）在瀏覽器端解析，不上傳原始文件。
- **語義檢索** - 基於關鍵詞與分塊的智能文檔檢索，增強 AI 回答。
- **長文本優化** - 粘貼長文本時自動轉為文件附件，保持對話整潔。
- **OCR 自動回退** - 當模型不支持多模態時，自動啟用 OCR 提取圖片文字。

### 🎯 進階功能
- **深度思考模式** - 開啟 AI 推理鏈（支持 o1、DeepSeek 等推理模型）。
- **隱身對話** - 開啟後對話不留痕跡，不存入本地歷史記錄。
- **多語言界面** - 支持簡體中文、繁體中文、English、日本語、한국어。
- **代碼高亮與公式** - 完善的 Markdown 渲染、LaTeX 公式及 Mermaid 圖表支持。

## 🚀 快速開始

### 環境要求
- Node.js >= 18.0
- npm >= 9.0

### 本地開發

```bash
# 克隆項目
git clone https://github.com/uxudjs/AiPiBox.git
cd AiPiBox

# 安裝依賴
npm install

# 一鍵啟動（代理服務器 + 前端服務器）
npm run dev:full

# 訪問 http://localhost:3000
```

## 📦 部署

AiPiBox 支持多種部署方式，應用會自動識別運行環境並配置 API 路徑。

| 平台 | 指令 | 數據庫/同步支持 | 推薦度 |
|------|------|----------------|--------|
| **Vercel** | `npm run deploy:vercel` | MySQL / PostgreSQL | ⭐⭐⭐⭐⭐ |
| **Netlify** | `npm run deploy:netlify` | MySQL / PostgreSQL | ⭐⭐⭐⭐⭐ |
| **Cloudflare Pages** | `npm run deploy:cf` | Cloudflare KV | ⭐⭐⭐⭐⭐ |
| **GitHub Pages** | `npm run build` | 需配置遠程代理 | ⭐⭐⭐ |

### 1️⃣ Vercel / Netlify (推薦)
1. Fork 本倉庫並關聯至平台。
2. 配置環境變量（可選）：`DB_TYPE`, `DB_HOST`, `DB_PASSWORD` 等（用於雲端同步）。
3. 平台將自動識別 `api/` 目錄下的 Serverless Functions。

### 2️⃣ Cloudflare Pages
1. 在 [Cloudflare Dashboard](https://dash.cloudflare.com) 中創建 Pages 項目。
2. 綁定一個名為 `SYNC_DATA` 的 **KV Namespace** 以啟用同步功能。
3. 執行 `npm run deploy:cf` 或關聯 Git 自動部署。

### 3️⃣ GitHub Pages
1. 構建項目：`npm run build`。
2. 將 `dist` 目錄上傳至 `gh-pages` 分支。
3. 在應用設置中手動指定 **雲端代理 URL**（由於 GitHub Pages 不支持後端腳本）。

## 🛠️ 技術棧

- **框架**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **樣式**: [Tailwind CSS](https://tailwindcss.com/) + [Framer Motion](https://www.framer.com/motion/)
- **狀態管理**: [Zustand](https://github.com/pmndrs/zustand)
- **數據庫**: [Dexie.js](https://dexie.org/) (IndexedDB)
- **渲染**: [React Markdown](https://github.com/remarkjs/react-markdown) + [KaTeX](https://katex.org/) + [Mermaid](https://mermaid.js.org/)
- **後端**: Node.js (Vercel/Netlify) / Cloudflare Workers (Pages)

## 📁 項目結構

```
AiPiBox/
├── api/                # Vercel/Netlify Serverless API
├── functions/          # Cloudflare Pages Functions
├── proxy/              # 本地代理服務器
├── src/
│   ├── components/     # UI、對話、圖像、知識庫等組件
│   ├── services/       # AI 服務、同步服務、解析器
│   ├── store/          # 狀態管理中心
│   ├── db/             # IndexedDB 配置
│   └── i18n/           # 多語言翻譯
├── tailwind.config.js  # 樣式配置
└── vite.config.js      # 構建配置
```

## 🔒 安全說明

*   **主密碼保護**：首次使用需設置主密碼，用於加密存儲在本地的所有敏感信息。
*   **端到端加密**：同步至雲端的數據均在客戶端使用 AES-GCM 加密，同步服務器無法獲取原文。

## 🤝 貢獻與反饋

歡迎提交 Pull Request 或 [Issue](https://github.com/uxudjs/AiPiBox/issues)！

本項目採用 [MIT 許可證](./LICENSE)。感謝所有貢獻者！

---

**享受與 AI 的智能對話體驗!** 🚀
