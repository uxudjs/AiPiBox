# 🤖 AiPiBox

<div align="center">

[![简体中文](https://img.shields.io/badge/lang-简体中文-red.svg)](../README.md)
[![日本語](https://img.shields.io/badge/lang-日本語-green.svg)](./README.ja.md)
[![한국어](https://img.shields.io/badge/lang-한국어-blue.svg)](./README.ko.md)
[![繁體中文](https://img.shields.io/badge/lang-繁體中文-orange.svg)](./README.zh-TW.md)

</div>

A powerful, privacy-focused modern AI conversation assistant application. Supports multi-model integration, knowledge base management, image generation, web publishing, and real-time code preview.

## ✨ Core Features

### 🔐 Privacy & Security
- **Local-First Storage** - All data stored in browser IndexedDB, encrypted by a master password.
- **End-to-End Encryption** - API keys and sensitive configurations encrypted using Web Crypto API (hardware-level).
- **Optional Cloud Sync** - Encrypted backup to cloud databases (MySQL/PostgreSQL/Cloudflare KV).
- **No Server Tracking** - Runs completely client-side, protecting user privacy.

### 💬 Intelligent Conversations
- **Multi-Model Support** - OpenAI, Claude, Gemini, Azure, Groq, DeepSeek, and other mainstream models.
- **Custom Providers** - Support for any OpenAI API-compatible service.
- **Message Tree Structure** - Support for branching conversations, explore different paths anytime.
- **Streaming Response** - Real-time AI responses with interrupt capability.
- **Auto-naming** - Intelligent generation of conversation titles.
- **Context Management** - Smart control of conversation context length with **Conversation Compression**.

### 🎨 Creation & Enhancement
- **Artifacts Preview** - Automatically render HTML/CSS/JS/Tailwind code blocks with real-time interactive preview.
- **One-click Publish** - Share conversation content or code snippets as online webpages.
- **Image Generation** - Integrated DALL-E 3/2, Stable Diffusion, supporting Text-to-Image and Image-to-Image.
- **Web Search** - Integrated Tavily, Google, and Bing for real-time information retrieval.

### 📚 Knowledge Base & Processing
- **Local Processing** - Documents (PDF/Word/Excel/PPT/TXT) are parsed in-browser; original files are never uploaded.
- **Semantic Retrieval** - Smart document retrieval based on keywords and chunks to enhance AI answers.
- **Long Text Optimization** - Automatically convert long pasted text into file attachments to keep conversations clean.
- **OCR Fallback** - Automatically enable OCR to extract text from images when models lack multimodal support.

### 🎯 Advanced Features
- **Deep Thinking Mode** - Enable AI reasoning chains (supports o1, DeepSeek, and other reasoning models).
- **Incognito Mode** - Private chats that leave no trace and are not saved in local history.
- **Multi-language Interface** - Simplified Chinese, Traditional Chinese, English, Japanese, Korean.
- **Rich Rendering** - Full Markdown support, LaTeX formulas, and Mermaid diagrams.

## 🚀 Quick Start

### Requirements
- Node.js >= 18.0
- npm >= 9.0

### Local Development

```bash
# Clone the project
git clone https://github.com/uxudjs/AiPiBox.git
cd AiPiBox

# Install dependencies
npm install

# One-command start (Proxy + Frontend server)
npm run dev:full

# Visit http://localhost:3000
```

## 📦 Deployment

AiPiBox supports multiple deployment methods. The app automatically detects the environment and configures API paths.

| Platform | Command | DB / Sync Support | Rating |
|----------|---------|-------------------|--------|
| **Vercel** | `npm run deploy:vercel` | MySQL / PostgreSQL | ⭐⭐⭐⭐⭐ |
| **Netlify** | `npm run deploy:netlify` | MySQL / PostgreSQL | ⭐⭐⭐⭐⭐ |
| **Cloudflare Pages** | `npm run deploy:cf` | Cloudflare KV | ⭐⭐⭐⭐⭐ |
| **GitHub Pages** | `npm run build` | Requires remote proxy | ⭐⭐⭐ |

### 1️⃣ Vercel / Netlify (Recommended)
1. Fork this repo and connect to the platform.
2. Set environment variables (optional): `DB_TYPE`, `DB_HOST`, `DB_PASSWORD`, etc. (for cloud sync).
3. The platform will automatically recognize Serverless Functions in the `api/` directory.

### 2️⃣ Cloudflare Pages
1. Create a Pages project in the [Cloudflare Dashboard](https://dash.cloudflare.com).
2. Bind a **KV Namespace** named `SYNC_DATA` to enable sync.
3. Run `npm run deploy:cf` or connect Git for auto-deployment.

### 3️⃣ GitHub Pages
1. Build project: `npm run build`.
2. Upload `dist` directory to the `gh-pages` branch.
3. Manually specify **Cloud Proxy URL** in app settings (as GH Pages doesn't support backend scripts).

## 🛠️ Tech Stack

- **Framework**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Framer Motion](https://www.framer.com/motion/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Database**: [Dexie.js](https://dexie.org/) (IndexedDB)
- **Rendering**: [React Markdown](https://github.com/remarkjs/react-markdown) + [KaTeX](https://katex.org/) + [Mermaid](https://mermaid.js.org/)
- **Backend**: Node.js (Vercel/Netlify) / Cloudflare Workers (Pages)

## 📁 Project Structure

```
AiPiBox/
├── api/                # Vercel/Netlify Serverless API
├── functions/          # Cloudflare Pages Functions
├── proxy/              # Local proxy server
├── src/
│   ├── components/     # UI, Chat, Image, Knowledge Base components
│   ├── services/       # AI, Sync services, Parsers
│   ├── store/          # Zustand store
│   ├── db/             # IndexedDB config
│   └── i18n/           # Translations
├── tailwind.config.js  # Style config
└── vite.config.js      # Build config
```

## 🔒 Security

*   **Master Password**: Set a password on first use to encrypt all sensitive data stored locally.
*   **End-to-End Encryption**: Data synced to the cloud is encrypted on the client using AES-GCM. The sync server cannot read your data.

## 🤝 Contributing

PRs and [Issues](https://github.com/uxudjs/AiPiBox/issues) are welcome!

Licensed under [MIT](./LICENSE). Thanks to all contributors!

---

**Enjoy the intelligent conversation experience with AI!** 🚀
