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
- **End-to-End Encryption** - Hardware-level encryption for API keys and sensitive config
- **Optional Cloud Sync** - Encrypted backup to cloud database
- **No Server Tracking** - Runs completely client-side, protecting user privacy

### 💬 Intelligent Conversations
- **Multi-Model Support** - OpenAI, Claude, Gemini, and other mainstream AI models
- **Custom Providers** - Support for any OpenAI API-compatible service
- **Context Management** - Smart control of conversation context length
- **Streaming Response** - Real-time display of AI responses
- **Conversation Groups** - Organize conversation history by time and tags
- **Auto-naming** - Intelligent generation of conversation titles

### 🌍 Internationalization
- **Multi-language Interface** - Simplified Chinese, Traditional Chinese, English, Japanese, Korean
- **AI Language Control** - Automatically instruct AI to respond in specified language
- **Localized Experience** - Complete interface translation and unified terminology

### 📚 Knowledge Base
- **Document Parsing** - Support for PDF, Word, Excel, PowerPoint
- **Vector Retrieval** - Keyword-based intelligent document retrieval
- **Conversation Integration** - Seamless reference of knowledge base content
- **Batch Management** - Efficient document upload and organization

### 🎨 Image Generation
- **Text-to-Image** - Generate images from text descriptions
- **Image-to-Image** - Generate variants based on reference images
- **Model Switching** - Support for DALL-E, Stable Diffusion, etc.
- **Parameter Control** - Fine-grained adjustment of size, quality, style, etc.
- **History Management** - Save and manage generated images

### 🌐 Web Search
- **Real-time Search** - Integration with Google, Bing, DuckDuckGo
- **Enhanced Answers** - AI combines latest information in responses
- **Configurable Engines** - Flexible selection of search providers

### 🎯 Advanced Features
- **Deep Thinking Mode** - Enable AI's chain-of-reasoning capabilities
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
| GitHub Pages | ⚠️* | ⚠️* | ✅ | ✅ | Free | ⭐⭐⭐ |
| Local Dev | ✅ | ✅ | ✅ | - | - | ⭐⭐⭐⭐ |

*GitHub Pages requires external API service configuration

### 1️⃣ Vercel (Recommended)

**Advantages**: Simple deployment, powerful performance, automatic HTTPS, global CDN

#### Method 1: CLI Deployment (Fastest)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy from project directory
vercel --prod

# Or use shortcut
npm run deploy:vercel
```

After deployment, you'll get a URL like `https://your-project.vercel.app`.

#### Method 2: Web Interface (Beginner-Friendly)

1. **Fork this repository** to your GitHub account
2. Visit [vercel.com](https://vercel.com) and login
3. Click **"Add New Project"**
4. Select the imported GitHub repository
5. **Framework Preset**: Choose `Vite`
6. **Build Configuration**:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
7. Click **"Deploy"**

#### Environment Variables (Optional)

To enable cloud sync functionality:

1. Add environment variables in Vercel project settings:
   ```
   DATABASE_TYPE=mysql
   DATABASE_URL=mysql://user:password@host:3306/aipibox
   ```
2. Redeploy the project

#### Verify Deployment

Visit `https://your-project.vercel.app/api/health` and you should see:
```json
{"status": "ok", "version": "1.0.0"}
```

---

### 2️⃣ Netlify

**Advantages**: Rich plugin ecosystem, form handling, authentication

#### Method 1: CLI Deployment

```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Login to Netlify
netlify login

# 3. Initialize project (first deployment)
netlify init

# 4. Deploy to production
netlify deploy --prod

# Or use shortcut
npm run deploy:netlify
```

#### Method 2: Web Interface

1. Visit [netlify.com](https://netlify.com) and login
2. Click **"Add new site"** → **"Import an existing project"**
3. Select **"GitHub"** and authorize
4. Select the AiPiBox repository
5. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Use defaults for other settings
6. Click **"Deploy site"**

#### Custom Domain (Optional)

1. In Netlify project settings, click **"Domain management"**
2. Add your custom domain
3. Configure DNS records as instructed

---

### 3️⃣ Cloudflare Pages

**Advantages**: World's fastest CDN, unlimited bandwidth, Workers integration

#### Method 1: CLI Deployment

```bash
# 1. Install Wrangler CLI
npm install -g wrangler

# 2. Login to Cloudflare
wrangler login

# 3. Build project
npm run build

# 4. Deploy to Cloudflare Pages
wrangler pages deploy dist --project-name=aipibox

# Or use shortcut
npm run deploy:cf
```

#### Method 2: Web Interface

1. Visit [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select **Workers & Pages** from left menu
3. Click **"Create application"** → **"Pages"** → **"Connect to Git"**
4. Select GitHub and authorize
5. Select the AiPiBox repository
6. **Build Settings**:
   - Framework preset: `None` or `Vite`
   - Build command: `npm run build`
   - Build output directory: `/dist`
7. Click **"Save and Deploy"**

#### Configure KV Namespace (Cloud Sync)

1. Create a KV Namespace in Cloudflare Dashboard
2. Go to Pages project **Settings** → **Functions** → **KV namespace bindings**
3. Add binding:
   - Variable name: `SYNC_DATA`
   - KV namespace: Select the namespace you just created
4. Redeploy the project

---

### 4️⃣ GitHub Pages

**Advantages**: Completely free, seamless GitHub integration

**Note**: GitHub Pages can only host static files and cannot run backend APIs. Requires additional proxy service configuration.

#### Automatic Deployment (Pre-configured)

The project includes GitHub Actions configuration. Simply push code to the `main` branch for automatic deployment.

1. **Fork this repository**
2. Go to repository **Settings** → **Pages**
3. Set **Source** to `GitHub Actions`
4. Wait for Actions to complete
5. Visit `https://<username>.github.io/AiPiBox/`

#### Configure External API Service

Since GitHub Pages doesn't support backend functions, you need to configure an external proxy:

**Recommended: Use Vercel Free Tier**

1. Fork this project again (or create a new branch)
2. Deploy this project on Vercel (for API only)
3. Get the Vercel deployment URL, e.g., `https://aipibox-api.vercel.app`
4. In GitHub Pages app:
   - Open **Settings** → **Network & Proxy**
   - **Cloud Proxy URL**: `https://aipibox-api.vercel.app/api/ai-proxy`
   - Click **Save and Apply**

**Alternative: Cloudflare Workers**

Deploy API using Cloudflare Workers, then configure the address:
```
https://your-worker.your-username.workers.dev/ai-proxy
```

---

### 5️⃣ Local Development

**Use Cases**: Development testing, feature debugging, offline usage

#### Complete Environment Setup

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

#### Automatic Environment Detection

The app automatically detects local environment and uses:
- Proxy address: `http://localhost:5000/api/proxy`
- Sync address: `http://localhost:5000/api/sync`

No manual configuration needed!

#### Production Build Testing

```bash
# Build production version
npm run build

# Preview build
npm run preview
```

---

### 🔧 Post-Deployment Configuration

Regardless of deployment method, on first visit you need to:

1. **Set Access Password**: For encrypting local data
2. **Configure API Keys**:
   - Open **Settings** → **Providers & Models**
   - Add your OpenAI, Claude, or other AI service API keys
   - Click **Test Connection** to verify
   - **Save and Apply**
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
- **Dexie.js** - IndexedDB wrapper

### UI Components
- **Lucide React** - Beautiful icon library
- **Framer Motion** - Smooth animations
- **React Markdown** - Markdown rendering

### Document Processing
- **PDF.js** - PDF document parsing
- **Mammoth** - Word document parsing
- **XLSX** - Excel spreadsheet processing

### Backend Services
- **Express** - Local proxy server
- **Serverless Functions** - Cloud API deployment

## 🔒 Data Security

### Local Encryption
- API keys encrypted using Web Crypto API
- Encryption keys derived from user password
- Sensitive config encrypted before storing in IndexedDB

### Cloud Sync
- Data encrypted on client before upload
- Server only stores encrypted data
- SHA-256 checksum for data integrity

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
- Ensure all tests pass

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
