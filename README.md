# 🤖 AiPiBox

<div align="center">

[![English](https://img.shields.io/badge/lang-English-blue.svg)](./docs/README.en.md)
[![日本語](https://img.shields.io/badge/lang-日本語-red.svg)](./docs/README.ja.md)
[![한국어](https://img.shields.io/badge/lang-한국어-green.svg)](./docs/README.ko.md)
[![繁體中文](https://img.shields.io/badge/lang-繁體中文-orange.svg)](./docs/README.zh-TW.md)

</div>

一个功能强大、注重隐私的现代化 AI 对话助手应用,支持多模型、多语言、知识库管理和图像生成。

## ✨ 核心特性

### 🔐 隐私与安全
- **本地优先存储** - 所有数据存储在浏览器 IndexedDB 中
- **端到端加密** - API 密钥和敏感配置采用 Web Crypto API 硬件级加密
- **可选云端同步** - 支持加密备份到云端数据库,数据在客户端加密后上传
- **无服务器追踪** - 完全在客户端运行,保护用户隐私

### 💬 智能对话
- **多模型支持** - OpenAI、Claude、Gemini、Azure、Groq、Perplexity 等主流 AI 模型
- **自定义提供商** - 支持添加任何兼容 OpenAI API 的服务
- **消息树结构** - 支持分支对话,可随时回溯和探索不同的对话路径
- **流式响应** - 实时显示 AI 回复内容,支持中断生成
- **对话压缩** - 自动或手动压缩历史对话,节省上下文空间
- **自动命名** - 智能生成对话标题
- **上下文管理** - 智能控制对话上下文长度

### 🌍 国际化
- **多语言界面** - 简体中文、繁体中文、English、日本語、한국어
- **AI 语言控制** - 自动指示 AI 使用指定语言回复
- **本地化体验** - 完整的界面翻译和术语统一

### 📚 知识库
- **文档解析** - 支持 PDF、Word、Excel、PowerPoint、TXT 等格式
- **本地处理** - 文档内容完全在浏览器端解析和索引,原始文件不上传
- **关键词检索** - 基于关键词的智能文档检索
- **对话集成** - 无缝引用知识库内容增强回答
- **批量管理** - 高效的文档上传和组织
- **云端同步** - 仅同步知识库元数据和索引结构

### 🎨 图像生成
- **文生图** - 通过文字描述生成图像
- **图生图** - 基于参考图生成变体
- **模型切换** - 支持 DALL-E 3、DALL-E 2、Stable Diffusion 等
- **参数控制** - 尺寸、质量、风格等细粒度调节
- **历史记录** - 保存和管理生成的图像
- **多种模式** - 支持标准、高清、艺术等不同生成模式

### 🌐 联网搜索
- **实时搜索** - 集成 Google、Bing、DuckDuckGo
- **增强回答** - AI 结合最新信息回复
- **可配置引擎** - 灵活选择搜索提供商

### 🎯 高级功能
- **深度思考模式** - 启用 AI 的推理链功能(支持 o1、DeepSeek 等模型)
- **多模态交互** - 支持图片上传、拍照识别、OCR 文字提取
- **代码高亮** - 支持多种编程语言语法高亮
- **数学公式** - LaTeX/KaTeX 数学公式渲染
- **Mermaid 图表** - 流程图、时序图等可视化
- **Markdown 增强** - GFM、表格、任务列表等

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0
- npm >= 9.0
- 现代浏览器(Chrome、Firefox、Edge、Safari)

### 本地开发

```bash
# 克隆项目
git clone https://github.com/uxudjs/AiPiBox.git
cd AiPiBox

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

### 生产构建

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 📦 部署

AiPiBox 支持多种部署方式,所有核心功能在各平台都能正常运行。

### 平台对比

| 平台 | AI代理 | 云端同步 | 图像生成 | 自动部署 | 成本 | 推荐度 |
|------|--------|---------|---------|---------|------|--------|
| Vercel | ✅ | ✅ | ✅ | ✅ | 免费 | ⭐⭐⭐⭐⭐ |
| Netlify | ✅ | ✅ | ✅ | ✅ | 免费 | ⭐⭐⭐⭐⭐ |
| Cloudflare Pages | ✅ | ✅ | ✅ | ✅ | 免费 | ⭐⭐⭐⭐⭐ |
| GitHub Pages | ⚠️* | ⚠️* | ✅ | ❌ | 免费 | ⭐⭐⭐ |
| 本地开发 | ✅ | ✅ | ✅ | - | - | ⭐⭐⭐⭐ |

*GitHub Pages 需要配置外部 API 服务

### 1️⃣ Vercel(推荐)

**优势**:部署简单、性能强大、自动 HTTPS、全球 CDN

#### 命令行部署(最快)

```bash
# 1. 安装 Vercel CLI
npm install -g vercel

# 2. 登录 Vercel 账号
vercel login

# 3. 在项目目录下执行部署
vercel --prod
```

#### 网页界面部署(新手友好)

1. Fork 本仓库到你的 GitHub 账号
2. 访问 [vercel.com](https://vercel.com) 并登录
3. 点击 "Add New Project"
4. 选择 AiPiBox 仓库
5. 框架预设:选择 `Vite`
6. 构建配置:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
7. 点击 "Deploy"

部署完成后,访问 `https://your-project.vercel.app/api/health` 验证:
```json
{"status": "ok", "version": "1.0.0"}
```

### 2️⃣ Netlify

#### 命令行部署

```bash
# 1. 安装 Netlify CLI
npm install -g netlify-cli

# 2. 登录 Netlify
netlify login

# 3. 初始化项目(首次部署)
netlify init

# 4. 部署到生产环境
netlify deploy --prod
```

#### 网页界面部署

1. 访问 [netlify.com](https://netlify.com) 并登录
2. 点击 "Add new site" → "Import an existing project"
3. 选择 GitHub 并授权
4. 选择 AiPiBox 仓库
5. 构建设置:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. 点击 "Deploy site"

### 3️⃣ Cloudflare Pages

**优势**:全球最快 CDN、无限带宽、Workers 集成

#### 命令行部署

```bash
# 1. 安装 Wrangler CLI
npm install -g wrangler

# 2. 登录 Cloudflare
wrangler login

# 3. 构建项目
npm run build

# 4. 部署到 Cloudflare Pages
wrangler pages deploy dist --project-name=aipibox
```

#### 网页界面部署

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 左侧菜单选择 "Workers & Pages"
3. 点击 "Create application" → "Pages" → "Connect to Git"
4. 选择 GitHub 并授权
5. 选择 AiPiBox 仓库
6. 构建设置:
   - Framework preset: `None` 或 `Vite`
   - Build command: `npm run build`
   - Build output directory: `/dist`
7. 点击 "Save and Deploy"

#### 配置 KV 命名空间(云端同步)

1. 在 Cloudflare Dashboard 中创建 KV Namespace
2. 进入 Pages 项目 Settings → Functions → KV namespace bindings
3. 添加绑定:
   - Variable name: `SYNC_DATA`
   - KV namespace: 选择刚创建的命名空间
4. 重新部署项目

### 4️⃣ GitHub Pages

**注意**:GitHub Pages 只能托管静态文件,无法执行后端 API。需要额外配置代理服务。

#### 部署步骤

1. Fork 本仓库
2. 构建项目:
```bash
npm install
npm run build
```

3. 使用 gh-pages 工具部署:
```bash
npm install -g gh-pages
gh-pages -d dist
```

4. 启用 GitHub Pages:
   - 进入仓库 Settings → Pages
   - Source: `Deploy from a branch`
   - Branch: `gh-pages` / `(root)`

5. 访问: `https://<username>.github.io/AiPiBox/`

#### 配置外部 API 服务

推荐使用 Vercel 免费套餐:

1. 在 Vercel 上部署本项目(仅用于 API)
2. 获取部署地址: `https://aipibox-api.vercel.app`
3. 在 GitHub Pages 应用中:
   - 打开 设置 → 网络与代理
   - 云端代理 URL: `https://aipibox-api.vercel.app/api/ai-proxy`
   - 保存并应用

### 5️⃣ 本地开发

```bash
# 1. 克隆项目
git clone https://github.com/uxudjs/AiPiBox.git
cd AiPiBox

# 2. 安装依赖
npm install

# 3. 一键启动(代理 + 开发服务器)
npm run dev:full

# 或分开启动:
# 终端 1: 启动代理服务器
npm run proxy

# 终端 2: 启动前端开发服务器
npm run dev
```

访问 `http://localhost:3000` 即可使用。

应用会自动检测本地环境,使用:
- 代理地址: `http://localhost:5000/api/proxy`
- 同步地址: `http://localhost:5000/api/sync`

### 🔧 部署后配置

无论使用哪种部署方式,首次访问应用时需要:

1. **设置访问密码**:用于加密本地数据
2. **配置 API 密钥**:
   - 打开 设置 → 提供商与模型
   - 添加你的 OpenAI、Claude 或其他 AI 服务的 API Key
   - 点击 测试连接 验证
   - 保存并应用
3. **选择语言**:设置 → 一般设置 → 语言

🎉 现在就可以开始使用了!

---

### 📚 更多文档

- [📖 完整部署指南](./DEPLOYMENT_GUIDE.md)
- [🌐 云端代理配置](./CLOUD_PROXY_SETUP.md)
- [💾 云端同步配置](./CLOUD_SYNC_SETUP.md)

## 🛠️ 技术栈

### 前端框架
- **React 18** - 用户界面构建
- **Vite** - 快速的开发构建工具
- **Tailwind CSS** - 实用优先的 CSS 框架

### 状态管理
- **Zustand** - 轻量级状态管理
- **Dexie.js** - IndexedDB 封装库,提供本地数据持久化

### UI 组件
- **Lucide React** - 精美的图标库
- **Framer Motion** - 流畅的动画效果
- **React Markdown** - Markdown 渲染
- **Highlight.js** - 代码语法高亮
- **KaTeX** - 数学公式渲染
- **Mermaid** - 图表可视化

### 文档处理
- **PDF.js** - PDF 文档解析
- **Mammoth** - Word 文档解析
- **XLSX** - Excel 表格处理

### 后端服务
- **Express** - 本地代理服务器
- **Serverless Functions** - 云端 API 部署(Vercel/Netlify/Cloudflare)

### 数据库支持
- **MySQL** - 关系型数据库(Vercel/Netlify)
- **PostgreSQL** - 关系型数据库(Vercel/Netlify)
- **Cloudflare KV** - 键值存储(Cloudflare Pages)

## 📁 项目结构

```
AiPiBox/
├── api/                      # Serverless API 端点
│   ├── ai-proxy.js          # AI 请求代理
│   ├── health.js            # 健康检查
│   ├── db-config.js         # 数据库配置
│   └── sync/                # 云端同步 API
│       ├── upload.js        # 上传数据
│       ├── download.js      # 下载数据
│       └── delete.js        # 删除数据
├── functions/               # Cloudflare Functions
│   ├── api/
│   │   ├── ai-proxy.js     # AI 代理(Cloudflare)
│   │   └── health.js       # 健康检查
│   └── sync/[[path]].js    # 动态路由同步
├── proxy/                   # 本地代理服务器
│   └── server.js           # Express 代理服务
├── public/                  # 静态资源
├── src/
│   ├── components/          # React 组件
│   │   ├── auth/           # 认证相关
│   │   ├── chat/           # 对话相关组件
│   │   ├── image/          # 图像生成组件
│   │   ├── layout/         # 布局组件
│   │   ├── settings/       # 设置界面
│   │   ├── sync/           # 同步状态组件
│   │   └── ui/             # 通用 UI 组件
│   ├── db/                  # IndexedDB 数据库
│   │   └── index.js        # Dexie 配置
│   ├── hooks/               # 自定义 Hooks
│   ├── i18n/                # 国际化系统
│   │   ├── index.js        # i18n 配置
│   │   └── translations/   # 翻译文件
│   │       ├── zh-CN.js    # 简体中文
│   │       ├── zh-TW.js    # 繁体中文
│   │       ├── en-US.js    # 英文
│   │       ├── ja-JP.js    # 日文
│   │       └── ko-KR.js    # 韩文
│   ├── router/              # 路由配置
│   ├── services/            # 业务服务
│   │   ├── aiService.js    # AI 服务封装
│   │   ├── documentParser.js # 文档解析
│   │   ├── logger.js       # 日志系统
│   │   └── syncService.js  # 同步服务
│   ├── store/               # Zustand 状态管理
│   │   ├── useAuthStore.js # 认证状态
│   │   ├── useChatStore.js # 聊天状态
│   │   ├── useConfigStore.js # 配置状态
│   │   ├── useFileStore.js # 文件状态
│   │   ├── useImageGenStore.js # 图像生成状态
│   │   ├── useKnowledgeBaseStore.js # 知识库状态
│   │   └── useViewStore.js # UI 状态
│   ├── utils/               # 工具函数
│   │   ├── cn.js           # 样式工具
│   │   ├── conflictResolver.js # 冲突解决
│   │   ├── constants.js    # 常量定义
│   │   ├── crypto.js       # 加密工具
│   │   ├── dataValidation.js # 数据验证
│   │   ├── diagnostics.js  # 诊断工具
│   │   ├── envDetect.js    # 环境检测
│   │   ├── imageCompression.js # 图片压缩
│   │   ├── modelNameInference.js # 模型名称推断
│   │   └── requestCache.js # 请求缓存
│   ├── App.jsx              # 根组件
│   ├── index.css            # 全局样式
│   └── main.jsx             # 应用入口
├── .env.example             # 环境变量模板
├── package.json             # 项目配置
├── vite.config.js           # Vite 配置
├── tailwind.config.js       # Tailwind 配置
├── vercel.json              # Vercel 配置
├── netlify.toml             # Netlify 配置
└── README.md                # 项目文档
```

## 🔒 数据安全

### 本地加密
- API 密钥使用 Web Crypto API 加密存储
- 采用用户密码派生的加密密钥(PBKDF2)
- 敏感配置加密后存入 IndexedDB

### 云端同步
- 数据在上传前在客户端加密(AES-GCM)
- 服务器仅存储加密后的数据
- 使用 SHA-256 校验数据完整性
- 支持冲突检测和解决机制

### 数据备份
```javascript
// 导出加密备份
设置 > 安全与数据 > 导出加密备份

// 导入备份
设置 > 安全与数据 > 导入备份
```

## 🐛 故障排除

### 应用白屏或无法加载

1. 清除浏览器缓存和数据
2. 按 F12 打开开发者工具查看错误
3. 在控制台运行诊断:
```javascript
window.__AiPiBoxDiagnostics.runDiagnostics()
```

### API 请求失败

- 检查 API 密钥是否正确
- 验证网络连接
- 确认代理配置(如使用)
- 查看系统日志:设置 > 系统日志

### 数据库错误

如遇到数据库相关错误:
```javascript
// 在控制台执行
localStorage.clear();
indexedDB.deleteDatabase('AiPiBoxDB');
location.reload();
```

### 云端同步问题

- 检查同步密码是否正确
- 验证数据库连接(如使用云端同步)
- 查看同步日志获取详细错误信息
- 尝试手动同步测试连接

## 🤝 贡献指南

欢迎贡献代码、报告问题或提出建议!

### 开发流程

1. Fork 本项目
2. 创建特性分支(`git checkout -b feature/AmazingFeature`)
3. 提交更改(`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支(`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 代码规范

- 使用 ESLint 进行代码检查
- 遵循现有的代码风格
- 添加必要的注释和文档
- 确保所有功能正常工作

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](https://github.com/uxudjs/AiPiBox/blob/main/LICENSE) 文件

## 🙏 致谢

本项目使用了以下开源项目:

- [React](https://react.dev/) - UI 框架
- [Vite](https://vitejs.dev/) - 构建工具
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [Zustand](https://github.com/pmndrs/zustand) - 状态管理
- [Dexie.js](https://dexie.org/) - IndexedDB 封装
- [React Markdown](https://github.com/remarkjs/react-markdown) - Markdown 渲染
- [Lucide](https://lucide.dev/) - 图标库
- [Highlight.js](https://highlightjs.org/) - 代码高亮
- [KaTeX](https://katex.org/) - 数学公式
- [Mermaid](https://mermaid.js.org/) - 图表渲染

感谢所有开源贡献者!

## 📞 联系方式

- 项目主页:[https://github.com/uxudjs/AiPiBox](https://github.com/uxudjs/AiPiBox)
- 问题反馈:[https://github.com/uxudjs/AiPiBox/issues](https://github.com/uxudjs/AiPiBox/issues)
- 讨论区:[https://github.com/uxudjs/AiPiBox/discussions](https://github.com/uxudjs/AiPiBox/discussions)

---

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=uxudjs/AiPiBox&type=Date)](https://star-history.com/#uxudjs/AiPiBox&Date)

---

**享受与 AI 的智能对话体验!** 🚀
