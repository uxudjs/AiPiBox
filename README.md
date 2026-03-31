# 🤖 AiPiBox

<div align="center">

[![English](https://img.shields.io/badge/lang-English-blue.svg)](./docs/README.en.md)
[![日本語](https://img.shields.io/badge/lang-日本語-red.svg)](./docs/README.ja.md)
[![한국어](https://img.shields.io/badge/lang-한국어-green.svg)](./docs/README.ko.md)
[![繁體中文](https://img.shields.io/badge/lang-繁體中文-orange.svg)](./docs/README.zh-TW.md)

</div>

一个功能强大、注重隐私的现代化 AI 对话助手应用。支持多模型集成、知识库管理、图像生成、网页发布及实时代码预览。

## ✨ 核心特性

### 🔐 隐私与安全
- **本地优先存储** - 所有数据存储在浏览器 IndexedDB 中，由主密码加密。
- **端到端加密** - API 密钥和敏感配置采用 Web Crypto API 硬件级加密。
- **可选云端同步** - 支持加密备份到云端存储（Cloudflare KV 或 MySQL/PostgreSQL）。
- **无服务器追踪** - 完全在客户端运行，保护用户隐私。

### 💬 智能对话
- **多模型支持** - 支持 OpenAI、Claude、Gemini、Azure、Groq、DeepSeek 等主流模型。
- **自定义提供商** - 支持添加任何兼容 OpenAI API 的服务。
- **消息树结构** - 支持分支对话，可随时回溯和探索不同的对话路径。
- **流式响应** - 实时显示 AI 回复内容，支持中断生成。
- **自动命名** - 智能生成对话标题。
- **上下文管理** - 智能控制对话上下文长度，支持**对话压缩**。

### 🎨 创作与增强
- **Artifacts 预览** - 自动渲染 HTML/CSS/JS/Tailwind 代码块，支持实时交互预览。
- **一键发布** - 支持将对话内容或代码片段发布为在线网页进行分享。
- **图像生成** - 集成 DALL-E 3/2、Stable Diffusion，支持文生图、图生图及参数微调。
- **联网搜索** - 集成 Tavily、Google、Bing 搜索引擎，获取实时信息。

### 📚 知识库与处理
- **本地处理** - 文档（PDF/Word/Excel/PPT/TXT）在浏览器端解析，不上传原始文件。
- **语义检索** - 基于关键词与分块的智能文档检索，增强 AI 回答。
- **长文本优化** - 粘贴长文本时自动转为文件附件，保持对话整洁。
- **OCR 自动回退** - 当模型不支持多模态时，自动启用 OCR 提取图片文字。

### 🎯 进阶功能
- **深度思考模式** - 开启 AI 推理链（支持 o1、DeepSeek 等推理模型）。
- **隐身对话** - 开启后对话不留痕迹，不存入本地历史记录。
- **多语言界面** - 支持简体中文、繁体中文、English、日本語、한국어。
- **代码高亮与公式** - 完善的 Markdown 渲染、LaTeX 公式及 Mermaid 图表支持。

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0
- npm >= 9.0

### 本地开发

```bash
# 克隆项目
git clone https://github.com/uxudjs/AiPiBox.git
cd AiPiBox

# 安装依赖
npm install

# 一键启动（本地代理服务器 + 前端服务器）
npm run dev:full

# 访问 http://localhost:3000
```

## 📦 部署与配置

AiPiBox 支持多种部署方式，应用会自动识别运行环境。**为确保功能完整，请务必配置相关环境变量。**

### 1️⃣ 环境变量说明 (通用)

无论选择哪种部署方式，建议配置以下变量以增强安全性与性能：

| 变量名 | 说明 | 推荐值 |
|--------|------|--------|
| `AUTH_SECRET` | 用于 HMAC 签名的密钥，保护 API 接口。 | 32位随机字符串 |
| `PROXY_RATE_LIMIT` | AI 代理接口每 IP 每分钟最大请求数。 | `60` |

---

### 2️⃣ Cloudflare Pages (推荐)

**步骤：**
1. 在 [Cloudflare Dashboard](https://dash.cloudflare.com) 中创建 Pages 项目。
2. **KV 绑定**：进入项目设置 -> Functions -> KV namespace bindings，添加一个绑定：
   - **Variable name**: `SYNC_DATA`
   - **KV namespace**: 选择您创建的 KV 命名空间。
3. **环境变量**：在同一设置页面的 "Environment variables" 中添加 `AUTH_SECRET` 和 `PROXY_RATE_LIMIT`。
4. **部署**：执行 `npm run deploy:cf` 或关联 Git 仓库。

---

### 3️⃣ Vercel / Netlify

**步骤：**
1. Fork 本仓库并关联至平台。
2. **环境变量**：在平台控制台配置 `AUTH_SECRET` 及以下**云端同步**相关变量：

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `DB_TYPE` | 数据库类型 | `mysql` 或 `postgres` |
| `DB_HOST` | 数据库主机地址 | `xxx.xxx.com` |
| `DB_NAME` | 数据库名称 | `aipibox` |
| `DB_USER` | 用户名 | `admin` |
| `DB_PASSWORD`| 密码 | `******` |
| `DB_SSL` | 是否启用 SSL 连接 | `true` |

3. 平台将自动识别 `api/` 目录下的 Serverless Functions。

---

### 4️⃣ GitHub Pages (仅前端)
1. 构建项目：`npm run build`。
2. 将 `dist` 目录上传至 `gh-pages` 分支。
3. **注意**：由于不支持后端脚本，必须在应用设置中手动指定**云端代理 URL**（可指向您在 Vercel 部署的 API 地址）。

## 🛠️ 技术栈

- **框架**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **样式**: [Tailwind CSS](https://tailwindcss.com/) + [Framer Motion](https://www.framer.com/motion/)
- **状态管理**: [Zustand](https://github.com/pmndrs/zustand)
- **数据库**: [Dexie.js](https://dexie.org/) (本地 IndexedDB)
- **渲染**: [React Markdown](https://github.com/remarkjs/react-markdown) + [KaTeX](https://katex.org/) + [Mermaid](https://mermaid.js.org/)
- **后端**: Node.js (Vercel/Netlify) / Cloudflare Workers (Pages)

## 📁 项目结构

```
AiPiBox/
├── api/                # Vercel/Netlify Serverless API (Node.js)
├── functions/          # Cloudflare Pages Functions (Workers)
├── proxy/              # 本地开发代理服务器
├── src/
│   ├── components/     # UI、对话、图像、知识库等组件
│   ├── services/       # AI 服务、同步服务、解析器
│   ├── store/          # Zustand 状态管理中心
│   ├── db/             # IndexedDB 本地数据库配置
│   └── i18n/           # 多语言国际化翻译
├── tailwind.config.js  # Tailwind CSS 配置
└── vite.config.js      # Vite 构建配置
```

## 🔒 安全说明

*   **主密码保护**：首次使用需设置主密码，用于加密存储在本地的所有敏感信息。
*   **端到端加密**：同步至云端的数据均在客户端使用 AES-GCM 加密，同步服务器无法获取原文。

## 🤝 贡献与反馈

欢迎提交 Pull Request 或 [Issue](https://github.com/uxudjs/AiPiBox/issues)！

本项目采用 [MIT 许可证](./LICENSE)。感谢所有贡献者！

---

**享受与 AI 的智能对话体验!** 🚀
