# 🤖 AiPiBox

<div align="center">

[![简体中文](https://img.shields.io/badge/lang-简体中文-red.svg)](../README.md)
[![日本語](https://img.shields.io/badge/lang-日本語-green.svg)](./README.ja.md)
[![한국어](https://img.shields.io/badge/lang-한국어-blue.svg)](./README.ko.md)
[![繁體中文](https://img.shields.io/badge/lang-繁體中文-orange.svg)](./README.zh-TW.md)

</div>

A powerful, privacy-focused modern AI conversation assistant application with multi-model support, multi-language capabilities, knowledge base management, and image generation.

## ✨ Core Features

### 🔐 Privacy & Security
- **Local-First Storage** - All data stored in browser IndexedDB
- **End-to-End Encryption** - API keys and sensitive configurations encrypted using Web Crypto API
- **Optional Cloud Sync** - Encrypted backup to cloud database, data encrypted on client before upload
- **No Server Tracking** - Runs completely client-side, protecting user privacy

### 💬 Intelligent Conversations
- **Multi-Model Support** - OpenAI, Claude, Gemini, Azure, Groq, Perplexity, and other mainstream AI models
- **Custom Providers** - Support for any OpenAI API-compatible service
- **Message Tree Structure** - Support for branching conversations, explore different conversation paths anytime
- **Streaming Response** - Real-time display of AI responses with interrupt capability
- **Conversation Compression** - Automatic or manual compression of conversation history to save context space
- **Auto-naming** - Intelligent generation of conversation titles
- **Context Management** - Smart control of conversation context length

### 🌍 Internationalization
- **Multi-language Interface** - Simplified Chinese, Traditional Chinese, English, Japanese, Korean
- **AI Language Control** - Automatically instruct AI to respond in specified language
- **Localized Experience** - Complete interface translation and unified terminology

### 📚 Knowledge Base
- **Document Parsing** - Support for PDF, Word, Excel, PowerPoint, TXT, and other formats
- **Local Processing** - Document content parsed and indexed entirely in browser, original files not uploaded
- **Keyword Retrieval** - Intelligent keyword-based document retrieval
- **Conversation Integration** - Seamlessly reference knowledge base content to enhance answers
- **Batch Management** - Efficient document upload and organization
- **Cloud Sync** - Synchronize only knowledge base metadata and index structures

### 🎨 Image Generation
- **Text-to-Image** - Generate images from text descriptions
- **Image-to-Image** - Generate variants based on reference images
- **Model Switching** - Support for DALL-E 3, DALL-E 2, Stable Diffusion, etc.
- **Parameter Control** - Fine-grained adjustment of size, quality, style, etc.
- **History Management** - Save and manage generated images
- **Multiple Modes** - Support standard, HD, artistic, and other generation modes

### 🌐 Web Search
- **Real-time Search** - Integration with Google, Bing, DuckDuckGo
- **Enhanced Answers** - AI combines latest information in responses
- **Configurable Engines** - Flexible selection of search providers

### 🎯 Advanced Features
- **Deep Thinking Mode** - Enable AI's chain-of-reasoning capabilities (supports o1, DeepSeek, and other models)
- **Multimodal Interaction** - Support for image upload, photo capture, OCR text extraction
- **Code Highlighting** - Support for multiple programming languages
- **Math Formulas** - LaTeX/KaTeX math formula rendering
- **Mermaid Charts** - Flowcharts, sequence diagrams, and other visualizations
- **Enhanced Markdown** - GFM, tables, task lists, etc.

## 🚀 Quick Start

### Requirements
- Node.js >= 18.0
- npm >= 9.0
- Modern browser (Chrome, Firefox, Edge, Safari)

### Local Development

```bash
# Clone the project
git clone https://github.com/uxudjs/AiPiBox.git
cd AiPiBox

# Install dependencies
npm install

# Start development server
npm run dev

# Visit http://localhost:3000
```

### Production Build

```bash
# Build for production
npm run build

# Preview build
npm run preview
```

## 📦 Deployment

AiPiBox supports multiple deployment methods, with all core features working across all platforms.

### Platform Comparison

| Platform | AI Proxy | Cloud Sync | Image Gen | Auto Deploy | Cost | Rating |
|----------|----------|------------|-----------|-------------|------|--------|
| Vercel | ✅ | ✅ | ✅ | ✅ | Free | ⭐⭐⭐⭐⭐ |
| Netlify | ✅ | ✅ | ✅ | ✅ | Free | ⭐⭐⭐⭐⭐ |
| Cloudflare Pages | ✅ | ✅ | ✅ | ✅ | Free | ⭐⭐⭐⭐⭐ |
| GitHub Pages | ⚠️* | ⚠️* | ✅ | ❌ | Free | ⭐⭐⭐ |
| Local Dev | ✅ | ✅ | ✅ | - | - | ⭐⭐⭐⭐ |

*GitHub Pages requires external API service configuration

### 1️⃣ Vercel (Recommended)

**Advantages**: Simple deployment, powerful performance, automatic HTTPS, global CDN

#### CLI Deployment (Fastest)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy from project directory
vercel --prod
```

#### Web Interface (Beginner-Friendly)

1. Fork this repository to your GitHub account
2. Visit [vercel.com](https://vercel.com) and login
3. Click "Add New Project"
4. Select the AiPiBox repository
5. Framework Preset: Choose `Vite`
6. Build Configuration:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
7. Click "Deploy"

After deployment, verify at `https://your-project.vercel.app/api/health`:
```json
{"status": "ok", "version": "1.0.0"}
```

### 2️⃣ Netlify

#### CLI Deployment

```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Login to Netlify
netlify login

# 3. Initialize project (first deployment)
netlify init

# 4. Deploy to production
netlify deploy --prod
```

#### Web Interface

1. Visit [netlify.com](https://netlify.com) and login
2. Click "Add new site" → "Import an existing project"
3. Select GitHub and authorize
4. Select the AiPiBox repository
5. Build Settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click "Deploy site"

### 3️⃣ Cloudflare Pages

**Advantages**: World's fastest CDN, unlimited bandwidth, Workers integration

#### CLI Deployment

```bash
# 1. Install Wrangler CLI
npm install -g wrangler

# 2. Login to Cloudflare
wrangler login

# 3. Build project
npm run build

# 4. Deploy to Cloudflare Pages
wrangler pages deploy dist --project-name=aipibox
```

#### Web Interface

1. Visit [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select "Workers & Pages" from left menu
3. Click "Create application" → "Pages" → "Connect to Git"
4. Select GitHub and authorize
5. Select the AiPiBox repository
6. Build Settings:
   - Framework preset: `None` or `Vite`
   - Build command: `npm run build`
   - Build output directory: `/dist`
7. Click "Save and Deploy"

#### Configure KV Namespace (Cloud Sync)

1. Create a KV Namespace in Cloudflare Dashboard
2. Go to Pages project Settings → Functions → KV namespace bindings
3. Add binding:
   - Variable name: `SYNC_DATA`
   - KV namespace: Select the namespace you just created
4. Redeploy the project

### 4️⃣ GitHub Pages

**Note**: GitHub Pages can only host static files and cannot run backend APIs. Requires additional proxy service configuration.

#### Deployment Steps

1. Fork this repository
2. Build the project:
```bash
npm install
npm run build
```

3. Deploy using gh-pages tool:
```bash
npm install -g gh-pages
gh-pages -d dist
```

4. Enable GitHub Pages:
   - Go to repository Settings → Pages
   - Source: `Deploy from a branch`
   - Branch: `gh-pages` / `(root)`

5. Visit: `https://<username>.github.io/AiPiBox/`

#### Configure External API Service

Recommended using Vercel free tier:

1. Deploy this project on Vercel (for API only)
2. Get deployment URL: `https://aipibox-api.vercel.app`
3. In GitHub Pages app:
   - Open Settings → Network & Proxy
   - Cloud Proxy URL: `https://aipibox-api.vercel.app/api/ai-proxy`
   - Save and Apply

### 5️⃣ Local Development

```bash
# 1. Clone project
git clone https://github.com/uxudjs/AiPiBox.git
cd AiPiBox

# 2. Install dependencies
npm install

# 3. One-command start (proxy + dev server)
npm run dev:full

# Or start separately:
# Terminal 1: Start proxy server
npm run proxy

# Terminal 2: Start frontend dev server
npm run dev
```

Visit `http://localhost:3000` to use.

The app automatically detects local environment and uses:
- Proxy address: `http://localhost:5000/api/proxy`
- Sync address: `http://localhost:5000/api/sync`

### 🔧 Post-Deployment Configuration

Regardless of deployment method, on first visit you need to:

1. **Set Access Password**: For encrypting local data
2. **Configure API Keys**:
   - Open Settings → Providers & Models
   - Add your OpenAI, Claude, or other AI service API keys
   - Click Test Connection to verify
   - Save and Apply
3. **Select Language**: Settings → General → Language

🎉 Now you can start using it!

---

### 📚 More Documentation

- [📖 Complete Deployment Guide](../DEPLOYMENT_GUIDE.md)
- [🌐 Cloud Proxy Setup](../CLOUD_PROXY_SETUP.md)
- [💾 Cloud Sync Setup](../CLOUD_SYNC_SETUP.md)

## 🛠️ Tech Stack

### Frontend Framework
- **React 18** - UI building
- **Vite** - Fast development build tool
- **Tailwind CSS** - Utility-first CSS framework

### State Management
- **Zustand** - Lightweight state management
- **Dexie.js** - IndexedDB wrapper for local data persistence

### UI Components
- **Lucide React** - Beautiful icon library
- **Framer Motion** - Smooth animations
- **React Markdown** - Markdown rendering
- **Highlight.js** - Code syntax highlighting
- **KaTeX** - Math formula rendering
- **Mermaid** - Chart visualization

### Document Processing
- **PDF.js** - PDF document parsing
- **Mammoth** - Word document parsing
- **XLSX** - Excel spreadsheet processing

### Backend Services
- **Express** - Local proxy server
- **Serverless Functions** - Cloud API deployment (Vercel/Netlify/Cloudflare)

### Database Support
- **MySQL** - Relational database (Vercel/Netlify)
- **PostgreSQL** - Relational database (Vercel/Netlify)
- **Cloudflare KV** - Key-value storage (Cloudflare Pages)

## 📁 Project Structure

```
AiPiBox/
├── api/                      # Serverless API endpoints
│   ├── ai-proxy.js          # AI request proxy
│   ├── health.js            # Health check
│   ├── db-config.js         # Database configuration
│   └── sync/                # Cloud sync API
│       ├── upload.js        # Upload data
│       ├── download.js      # Download data
│       └── delete.js        # Delete data
├── functions/               # Cloudflare Functions
│   ├── api/
│   │   ├── ai-proxy.js     # AI proxy (Cloudflare)
│   │   └── health.js       # Health check
│   └── sync/[[path]].js    # Dynamic route sync
├── proxy/                   # Local proxy server
│   └── server.js           # Express proxy service
├── public/                  # Static assets
├── src/
│   ├── components/          # React components
│   │   ├── auth/           # Authentication
│   │   ├── chat/           # Chat components
│   │   ├── image/          # Image generation
│   │   ├── layout/         # Layout components
│   │   ├── settings/       # Settings interface
│   │   ├── sync/           # Sync status
│   │   └── ui/             # Common UI components
│   ├── db/                  # IndexedDB database
│   │   └── index.js        # Dexie configuration
│   ├── hooks/               # Custom Hooks
│   ├── i18n/                # Internationalization
│   │   ├── index.js        # i18n config
│   │   └── translations/   # Translation files
│   │       ├── zh-CN.js    # Simplified Chinese
│   │       ├── zh-TW.js    # Traditional Chinese
│   │       ├── en-US.js    # English
│   │       ├── ja-JP.js    # Japanese
│   │       └── ko-KR.js    # Korean
│   ├── router/              # Router configuration
│   ├── services/            # Business services
│   │   ├── aiService.js    # AI service wrapper
│   │   ├── documentParser.js # Document parsing
│   │   ├── logger.js       # Logging system
│   │   └── syncService.js  # Sync service
│   ├── store/               # Zustand state management
│   │   ├── useAuthStore.js # Auth state
│   │   ├── useChatStore.js # Chat state
│   │   ├── useConfigStore.js # Config state
│   │   ├── useFileStore.js # File state
│   │   ├── useImageGenStore.js # Image gen state
│   │   ├── useKnowledgeBaseStore.js # Knowledge base
│   │   └── useViewStore.js # UI state
│   ├── utils/               # Utility functions
│   │   ├── cn.js           # Style utilities
│   │   ├── conflictResolver.js # Conflict resolution
│   │   ├── constants.js    # Constants
│   │   ├── crypto.js       # Encryption utilities
│   │   ├── dataValidation.js # Data validation
│   │   ├── diagnostics.js  # Diagnostics
│   │   ├── envDetect.js    # Environment detection
│   │   ├── imageCompression.js # Image compression
│   │   ├── modelNameInference.js # Model name inference
│   │   └── requestCache.js # Request caching
│   ├── App.jsx              # Root component
│   ├── index.css            # Global styles
│   └── main.jsx             # App entry
├── .env.example             # Environment template
├── package.json             # Project config
├── vite.config.js           # Vite config
├── tailwind.config.js       # Tailwind config
├── vercel.json              # Vercel config
├── netlify.toml             # Netlify config
└── README.md                # Documentation
```

## 🔒 Data Security

### Local Encryption
- API keys encrypted using Web Crypto API
- Encryption keys derived from user password (PBKDF2)
- Sensitive config encrypted before storing in IndexedDB

### Cloud Sync
- Data encrypted on client before upload (AES-GCM)
- Server only stores encrypted data
- SHA-256 checksum for data integrity
- Conflict detection and resolution support

### Data Backup
```javascript
// Export encrypted backup
Settings > Security & Data > Export Encrypted Backup

// Import backup
Settings > Security & Data > Import Backup
```

## 🐛 Troubleshooting

### App White Screen or Won't Load

1. Clear browser cache and data
2. Press F12 to open developer tools and check errors
3. Run diagnostics in console:
```javascript
window.__AiPiBoxDiagnostics.runDiagnostics()
```

### API Request Failures

- Check if API key is correct
- Verify network connection
- Confirm proxy configuration (if used)
- Check system logs: Settings > System Logs

### Database Errors

If you encounter database-related errors:
```javascript
// Execute in console
localStorage.clear();
indexedDB.deleteDatabase('AiPiBoxDB');
location.reload();
```

### Cloud Sync Issues

- Check if sync password is correct
- Verify database connection (if using cloud sync)
- Check sync logs for detailed error information
- Try manual sync to test connection

## 🤝 Contributing

Contributions of code, bug reports, or suggestions are welcome!

### Development Workflow

1. Fork this project
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

### Code Standards

- Use ESLint for code checking
- Follow existing code style
- Add necessary comments and documentation
- Ensure all features work properly

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/uxudjs/AiPiBox/blob/main/LICENSE) file for details

## 🙏 Acknowledgments

This project uses the following open-source projects:

- [React](https://react.dev/) - UI framework
- [Vite](https://vitejs.dev/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Zustand](https://github.com/pmndrs/zustand) - State management
- [Dexie.js](https://dexie.org/) - IndexedDB wrapper
- [React Markdown](https://github.com/remarkjs/react-markdown) - Markdown rendering
- [Lucide](https://lucide.dev/) - Icon library
- [Highlight.js](https://highlightjs.org/) - Code highlighting
- [KaTeX](https://katex.org/) - Math formulas
- [Mermaid](https://mermaid.js.org/) - Chart rendering

Thanks to all open-source contributors!

## 📞 Contact

- Project Homepage: [https://github.com/uxudjs/AiPiBox](https://github.com/uxudjs/AiPiBox)
- Issue Tracker: [https://github.com/uxudjs/AiPiBox/issues](https://github.com/uxudjs/AiPiBox/issues)
- Discussions: [https://github.com/uxudjs/AiPiBox/discussions](https://github.com/uxudjs/AiPiBox/discussions)

---

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=uxudjs/AiPiBox&type=Date)](https://star-history.com/#uxudjs/AiPiBox&Date)

---

**Enjoy the intelligent conversation experience with AI!** 🚀
