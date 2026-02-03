# 🤖 AiPiBox

<div align="center">

[![简体中文](https://img.shields.io/badge/lang-简体中文-red.svg)](../README.md)
[![English](https://img.shields.io/badge/lang-English-blue.svg)](./README.en.md)
[![日本語](https://img.shields.io/badge/lang-日本語-green.svg)](./README.ja.md)
[![한국어](https://img.shields.io/badge/lang-한국어-orange.svg)](./README.ko.md)

</div>

一個功能強大、注重隱私的現代化 AI 對話助手應用，支援多模型、多語言、知識庫管理和圖像生成。

## ✨ 核心特性

### 🔐 隱私與安全
- **本地優先儲存** - 所有資料儲存在瀏覽器 IndexedDB 中
- **端對端加密** - API 金鑰和敏感配置採用硬體級加密
- **可選雲端同步** - 支援加密備份到雲端資料庫
- **無伺服器追蹤** - 完全在客戶端執行，保護使用者隱私

### 💬 智慧對話
- **多模型支援** - OpenAI、Claude、Gemini 等主流 AI 模型
- **自訂提供商** - 支援新增任何相容 OpenAI API 的服務
- **上下文管理** - 智慧控制對話上下文長度
- **串流回應** - 即時顯示 AI 回覆內容
- **對話分組** - 按時間、標籤組織對話歷史
- **自動命名** - 智慧生成對話標題

### 🌍 國際化
- **多語言介面** - 簡體中文、繁體中文、English、日本語、한국어
- **AI 語言控制** - 自動指示 AI 使用指定語言回覆
- **本地化體驗** - 完整的介面翻譯和術語統一

### 📚 知識庫
- **文件解析** - 支援 PDF、Word、Excel、PowerPoint
- **向量檢索** - 基於關鍵詞的智慧文件檢索
- **對話整合** - 無縫引用知識庫內容增強回答
- **批次管理** - 高效的文件上傳和組織

### 🎨 圖像生成
- **文生圖** - 透過文字描述生成圖像
- **圖生圖** - 基於參考圖生成變體
- **模型切換** - 支援 DALL-E、Stable Diffusion 等
- **參數控制** - 尺寸、品質、風格等細粒度調節
- **歷史記錄** - 儲存和管理生成的圖像

### 🌐 聯網搜尋
- **即時搜尋** - 整合 Google、Bing、DuckDuckGo
- **增強回答** - AI 結合最新資訊回覆
- **可配置引擎** - 彈性選擇搜尋提供商

### 🎯 進階功能
- **深度思考模式** - 啟用 AI 的推理鏈功能
- **程式碼高亮** - 支援多種程式語言語法高亮
- **數學公式** - LaTeX/KaTeX 數學公式渲染
- **Mermaid 圖表** - 流程圖、時序圖等視覺化
- **Markdown 增強** - GFM、表格、任務清單等

## 🚀 快速開始

### 環境要求
- Node.js >= 18.0
- npm >= 9.0
- 現代瀏覽器（Chrome、Firefox、Edge、Safari）

### 本地開發

```bash
# 複製專案
git clone https://github.com/uxudjs/AiPiBox.git
cd AiPiBox

# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev

# 訪問 http://localhost:3000
```

### 生產建置

```bash
# 建置生產版本
npm run build

# 預覽建置結果
npm run preview
```

## 📦 部署

AiPiBox 支援多種部署方式，所有核心功能在各平台都能正常運作。

### 平台對比

| 平台 | AI代理 | 雲端同步 | 圖像生成 | 自動部署 | 成本 | 推薦度 |
|------|--------|---------|---------|---------|------|--------|
| Vercel | ✅ | ✅ | ✅ | ✅ | 免費 | ⭐⭐⭐⭐⭐ |
| Netlify | ✅ | ✅ | ✅ | ✅ | 免費 | ⭐⭐⭐⭐⭐ |
| Cloudflare Pages | ✅ | ✅ | ✅ | ✅ | 免費 | ⭐⭐⭐⭐⭐ |
| GitHub Pages | ⚠️* | ⚠️* | ✅ | ❌ | 免費 | ⭐⭐⭐ |
| 本地開發 | ✅ | ✅ | ✅ | - | - | ⭐⭐⭐⭐ |

*GitHub Pages 需要配置外部 API 服務

### 1️⃣ Vercel（推薦）

**優勢**：部署簡單、效能強大、自動 HTTPS、全球 CDN

#### 方法一：命令列部署（最快）

```bash
# 1. 安裝 Vercel CLI
npm install -g vercel

# 2. 登入 Vercel 帳號
vercel login

# 3. 在專案目錄下執行部署
vercel --prod

# 或使用快捷指令
npm run deploy:vercel
```

部署完成後，您將獲得一個類似 `https://your-project.vercel.app` 的地址。

#### 方法二：網頁介面部署（新手友好）

1. **Fork 本儲存庫**到你的 GitHub 帳號
2. 訪問 [vercel.com](https://vercel.com) 並登入
3. 點擊 **"Add New Project"**
4. 選擇匯入的 GitHub 儲存庫
5. **框架預設**：選擇 `Vite`
6. **建置配置**：
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
7. 點擊 **"Deploy"**

#### 環境變數（可選）

如果需要啟用雲端同步功能：

1. 在 Vercel 專案設定中新增環境變數：
   ```
   DATABASE_TYPE=mysql
   DATABASE_URL=mysql://user:password@host:3306/aipibox
   ```
2. 重新部署專案

#### 驗證部署

訪問 `https://your-project.vercel.app/api/health` 應該看到：
```json
{"status": "ok", "version": "1.0.0"}
```

---

### 2️⃣ Netlify

**優勢**：豐富的外掛生態、表單處理、身分驗證

#### 方法一：命令列部署

```bash
# 1. 安裝 Netlify CLI
npm install -g netlify-cli

# 2. 登入 Netlify
netlify login

# 3. 初始化專案（首次部署）
netlify init

# 4. 部署到生產環境
netlify deploy --prod

# 或使用快捷指令
npm run deploy:netlify
```

#### 方法二：網頁介面部署

1. 訪問 [netlify.com](https://netlify.com) 並登入
2. 點擊 **"Add new site"** → **"Import an existing project"**
3. 選擇 **"GitHub"** 並授權
4. 選擇 AiPiBox 儲存庫
5. **建置設定**：
   - Build command: `npm run build`
   - Publish directory: `dist`
   - 其他設定使用預設值
6. 點擊 **"Deploy site"**

#### 自訂網域（可選）

1. 在 Netlify 專案設定中點擊 **"Domain management"**
2. 新增您的自訂網域
3. 按照指示配置 DNS 記錄

---

### 3️⃣ Cloudflare Pages

**優勢**：全球最快 CDN、無限頻寬、Workers 整合

#### 方法一：命令列部署

```bash
# 1. 安裝 Wrangler CLI
npm install -g wrangler

# 2. 登入 Cloudflare
wrangler login

# 3. 建置專案
npm run build

# 4. 部署到 Cloudflare Pages
wrangler pages deploy dist --project-name=aipibox

# 或使用快捷指令
npm run deploy:cf
```

#### 方法二：網頁介面部署

1. 訪問 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 左側選單選擇 **Workers & Pages**
3. 點擊 **"Create application"** → **"Pages"** → **"Connect to Git"**
4. 選擇 GitHub 並授權
5. 選擇 AiPiBox 儲存庫
6. **建置設定**：
   - Framework preset: `None` 或 `Vite`
   - Build command: `npm run build`
   - Build output directory: `/dist`
7. 點擊 **"Save and Deploy"**

#### 配置 KV 命名空間（雲端同步）

1. 在 Cloudflare Dashboard 中建立 KV Namespace
2. 進入 Pages 專案 **Settings** → **Functions** → **KV namespace bindings**
3. 新增繫結：
   - Variable name: `SYNC_DATA`
   - KV namespace: 選擇剛建立的命名空間
4. 重新部署專案

---

### 4️⃣ GitHub Pages

**優勢**：完全免費、與 GitHub 整合無縫

**注意**：GitHub Pages 只能託管靜態檔案，無法執行後端 API。需要額外配置代理服務。

#### 自動部署（手動上傳）

GitHub Pages 需要手動建置和部署。

**步驟：**

1. **Fork 本儲存庫**
   - 訪問 [AiPiBox GitHub](https://github.com/uxudjs/AiPiBox)
   - 點擊右上角 **"Fork"** 按鈕
   - 儲存庫被複製到你的帳號下

2. **建置專案**
   ```bash
   # 複製你 Fork 的儲存庫
   git clone https://github.com/<your-username>/AiPiBox.git
   cd AiPiBox
   
   # 安裝依賴
   npm install
   
   # 建置
   npm run build
   ```

3. **使用 gh-pages 工具部署**
   ```bash
   # 安裝 gh-pages
   npm install -g gh-pages
   
   # 部署到 GitHub Pages
   gh-pages -d dist
   ```

4. **啟用 GitHub Pages**
   - 進入你 Fork 的儲存庫
   - 點擊 **Settings** → **Pages**
   - **Source** 選擇 `Deploy from a branch`
   - **Branch** 選擇 `gh-pages` / `(root)`
   - 儲存設定

5. **訪問應用**
   - 回到 **Settings** → **Pages**
   - 找到你的站點地址：`https://<username>.github.io/AiPiBox/`
   - 點擊訪問

6. **後續更新**
   - 每次修改程式碼後，重複步驟2和3
   - 重新建置並部署

#### 配置外部 API 服務

因為 GitHub Pages 不支援後端函數，需要配置外部代理：

**推薦方案：使用 Vercel 免費套餐**

1. 再次 Fork 本專案（或建立新分支）
2. 在 Vercel 上部署這個專案（僅用於 API）
3. 獲取 Vercel 部署地址，如 `https://aipibox-api.vercel.app`
4. 在 GitHub Pages 應用中：
   - 開啟 **設定** → **網路與代理**
   - **雲端代理 URL** 填寫：`https://aipibox-api.vercel.app/api/ai-proxy`
   - 點擊 **儲存並套用**

**備選方案：Cloudflare Workers**

使用 Cloudflare Workers 部署 API，然後配置地址：
```
https://your-worker.your-username.workers.dev/ai-proxy
```

---

### 5️⃣ 本地開發

**適用場景**：開發測試、功能除錯、離線使用

#### 完整環境搭建

```bash
# 1. 複製專案
git clone https://github.com/uxudjs/AiPiBox.git
cd AiPiBox

# 2. 安裝依賴
npm install

# 3. 一鍵啟動（代理 + 開發伺服器）
npm run dev:full

# 或者分開啟動：
# 終端機 1: 啟動代理伺服器
npm run proxy

# 終端機 2: 啟動前端開發伺服器
npm run dev
```

訪問 `http://localhost:3000` 即可使用。

#### 環境自動檢測

應用會自動檢測本地環境，使用：
- 代理地址：`http://localhost:5000/api/proxy`
- 同步地址：`http://localhost:5000/api/sync`

無需手動配置！

#### 生產建置測試

```bash
# 建置生產版本
npm run build

# 預覽建置結果
npm run preview
```

---

### 🔧 部署後配置

無論使用哪種部署方式，首次訪問應用時需要：

1. **設定訪問密碼**：用於加密本地資料
2. **配置 API 金鑰**：
   - 開啟 **設定** → **提供商與模型**
   - 新增你的 OpenAI、Claude 或其他 AI 服務的 API Key
   - 點擊 **測試連接** 驗證
   - **儲存並套用**
3. **選擇語言**：設定 → 一般設定 → 語言

🎉 現在就可以開始使用了！

---

### 📚 更多文件

- [📖 完整部署指南](../DEPLOYMENT_GUIDE.md)
- [🌐 雲端代理配置](../CLOUD_PROXY_SETUP.md)
- [💾 雲端同步配置](../CLOUD_SYNC_SETUP.md)

## 🛠️ 技術棧

### 前端框架
- **React 18** - 使用者介面建置
- **Vite** - 快速的開發建置工具
- **Tailwind CSS** - 實用優先的 CSS 框架

### 狀態管理
- **Zustand** - 輕量級狀態管理
- **Dexie.js** - IndexedDB 封裝庫

### UI 元件
- **Lucide React** - 精美的圖示庫
- **Framer Motion** - 流暢的動畫效果
- **React Markdown** - Markdown 渲染

### 文件處理
- **PDF.js** - PDF 文件解析
- **Mammoth** - Word 文件解析
- **XLSX** - Excel 表格處理

### 後端服務
- **Express** - 本地代理伺服器
- **Serverless Functions** - 雲端 API 部署

## 🔒 資料安全

### 本地加密
- API 金鑰使用 Web Crypto API 加密儲存
- 採用使用者密碼派生的加密金鑰
- 敏感配置加密後存入 IndexedDB

### 雲端同步
- 資料在上傳前在客戶端加密
- 伺服器僅儲存加密後的資料
- 使用 SHA-256 校驗資料完整性

### 資料備份
```javascript
// 匯出加密備份
設定 > 安全與資料 > 匯出加密備份

// 匯入備份
設定 > 安全與資料 > 匯入備份
```

## 🐛 故障排除

### 應用白屏或無法載入

1. 清除瀏覽器快取和資料
2. 按 F12 開啟開發者工具檢視錯誤
3. 在控制台執行診斷：
```javascript
window.__AiPiBoxDiagnostics.runDiagnostics()
```

### API 請求失敗

- 檢查 API 金鑰是否正確
- 驗證網路連線
- 確認代理配置（如使用）
- 檢視系統日誌：設定 > 系統日誌

### 資料庫錯誤

如遇到資料庫相關錯誤：
```javascript
// 在控制台執行
localStorage.clear();
indexedDB.deleteDatabase('AiPiBoxDB');
location.reload();
```

## 🤝 貢獻指南

歡迎貢獻程式碼、報告問題或提出建議！

### 開發流程

1. Fork 本專案
2. 建立特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

### 程式碼規範

- 使用 ESLint 進行程式碼檢查
- 遵循現有的程式碼風格
- 新增必要的註解和文件
- 確保所有測試通過

## 📄 授權

本專案採用 MIT 授權 - 詳見 [LICENSE](https://github.com/uxudjs/AiPiBox/blob/main/LICENSE) 檔案

## 🙏 致謝

本專案使用了以下開源專案：

- [React](https://react.dev/) - UI 框架
- [Vite](https://vitejs.dev/) - 建置工具
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [Zustand](https://github.com/pmndrs/zustand) - 狀態管理
- [Dexie.js](https://dexie.org/) - IndexedDB 封裝
- [React Markdown](https://github.com/remarkjs/react-markdown) - Markdown 渲染
- [Lucide](https://lucide.dev/) - 圖示庫

感謝所有開源貢獻者！

## 📞 聯絡方式

- 專案主頁：[https://github.com/uxudjs/AiPiBox](https://github.com/uxudjs/AiPiBox)
- 問題反饋：[https://github.com/uxudjs/AiPiBox/issues](https://github.com/uxudjs/AiPiBox/issues)
- 討論區：[https://github.com/uxudjs/AiPiBox/discussions](https://github.com/uxudjs/AiPiBox/discussions)

---

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=uxudjs/AiPiBox&type=Date)](https://star-history.com/#uxudjs/AiPiBox&Date)

---

**享受與 AI 的智慧對話體驗！** 🚀
