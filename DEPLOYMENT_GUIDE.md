# AiPiBox 多平台部署完整指南

## 📋 目录

- [平台支持概览](#平台支持概览)
- [环境要求](#环境要求)
- [Vercel 部署](#vercel-部署)
- [Netlify 部署](#netlify-部署)
- [Cloudflare Pages 部署](#cloudflare-pages-部署)
- [GitHub Pages 部署](#github-pages-部署)
- [本地开发部署](#本地开发部署)
- [功能对比](#功能对比)
- [常见问题](#常见问题)

---

## 平台支持概览

AiPiBox 支持多种部署平台,所有核心功能在各平台都能正常运行:

| 平台 | AI代理 | 云端同步 | 图像生成 | 自动部署 | 推荐度 |
|------|--------|---------|---------|---------|--------|
| Vercel | ✅ | ✅ | ✅ | ✅ | ⭐⭐⭐⭐⭐ |
| Netlify | ✅ | ✅ | ✅ | ✅ | ⭐⭐⭐⭐⭐ |
| Cloudflare Pages | ✅ | ✅ | ✅ | ✅ | ⭐⭐⭐⭐⭐ |
| GitHub Pages | ⚠️ | ⚠️ | ✅ | ✅ | ⭐⭐⭐ |
| 本地开发 | ✅ | ✅ | ✅ | N/A | ⭐⭐⭐⭐ |

⚠️ GitHub Pages 需要外部API服务支持

---

## 环境要求

### 基础要求
- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

### 可选工具
- Vercel CLI: `npm install -g vercel`
- Netlify CLI: `npm install -g netlify-cli`
- Wrangler CLI: `npm install -g wrangler`

---

## Vercel 部署

### 方法一: 通过Vercel CLI (推荐)

```bash
# 1. 安装Vercel CLI
npm install -g vercel

# 2. 登录Vercel
vercel login

# 3. 部署
vercel --prod

# 或使用快捷命令
npm run deploy:vercel
```

### 方法二: 通过Vercel网页

1. 访问 [vercel.com](https://vercel.com)
2. 点击 "New Project"
3. 导入 GitHub 仓库
4. 框架预设: Vite
5. 构建命令: `npm run build`
6. 输出目录: `dist`
7. 点击 "Deploy"

### 环境变量配置

在 Vercel 项目设置 → Environment Variables 添加:

```
# 云端同步数据库(可选)
DATABASE_URL=mysql://user:pass@host:3306/dbname
DATABASE_TYPE=mysql
```

### 验证部署

访问: `https://your-project.vercel.app/api/health`

预期响应:
```json
{
  "status": "ok",
  "version": "1.0.0",
  "time": "2026-02-02T10:30:00.000Z"
}
```

### 配置应用

1. 打开部署的应用
2. 进入设置 → 网络与代理
3. 代理会自动检测为: `/api/ai-proxy`
4. 无需额外配置,即可使用

---

## Netlify 部署

### 方法一: 通过Netlify CLI

```bash
# 1. 安装Netlify CLI
npm install -g netlify-cli

# 2. 登录
netlify login

# 3. 初始化项目
netlify init

# 4. 部署
netlify deploy --prod

# 或使用快捷命令
npm run deploy:netlify
```

### 方法二: 通过Netlify网页

1. 访问 [netlify.com](https://netlify.com)
2. 点击 "Add new site"
3. 导入 GitHub 仓库
4. 构建设置:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. 点击 "Deploy site"

### Netlify配置文件

项目已包含 `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 环境变量

在 Netlify UI → Site settings → Environment variables 添加:

```
DATABASE_URL=your_database_url
DATABASE_TYPE=mysql
```

---

## Cloudflare Pages 部署

### 方法一: 通过Wrangler CLI

```bash
# 1. 安装Wrangler
npm install -g wrangler

# 2. 登录Cloudflare
wrangler login

# 3. 构建项目
npm run build

# 4. 部署到Cloudflare Pages
wrangler pages deploy dist

# 或使用快捷命令
npm run deploy:cf
```

### 方法二: 通过Cloudflare Dashboard

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 Workers & Pages
3. 创建 → Pages → 连接 Git
4. 选择 GitHub 仓库
5. 构建设置 (⚠️ **非常重要**):
   - **Framework preset**: `None`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Deploy command** (如果出现): 确保设置为 `npx wrangler pages deploy dist` 或留空，**不要** 设置为 `npx wrangler deploy`。
6. 点击 "Save and Deploy"

> 💡 **提示**: 如果部署报错 `Workers-specific command in a Pages project`，请检查项目设置中的 "Deploy Command" 是否被错误地设为了 `npx wrangler deploy`。将其修正为 `npx wrangler pages deploy dist` 即可。

### Cloudflare Workers Functions

项目已包含 `functions/` 目录:
- `functions/ai-proxy.js` - AI代理
- `functions/health.js` - 健康检查
- `functions/sync/[[path]].js` - 云端同步

### KV命名空间配置

1. 在 Cloudflare Dashboard 创建 KV 命名空间
2. 绑定到 Pages 项目:
   - 变量名: `SYNC_DATA`
   - KV namespace: 选择创建的命名空间
3. 重新部署

### 特性

- ✅ 全球CDN加速
- ✅ Workers函数支持
- ✅ KV存储(云端同步)
- ✅ 无限带宽(免费)

---

## GitHub Pages 部署

### 自动部署(GitHub Actions)

项目已包含 `.github/workflows/deploy-gh-pages.yml`,提交代码即自动部署。

### 手动启用GitHub Pages

1. 进入 GitHub 仓库
2. Settings → Pages
3. Source: GitHub Actions
4. 等待 Actions 运行完成

### 访问地址

```
https://<username>.github.io/<repository>/
```

### ⚠️ 重要限制

GitHub Pages 仅支持静态文件,无法运行后端API。需要配置外部API服务:

#### 选项1: 使用Vercel免费套餐部署API

```bash
# 仅部署API函数
vercel --prod
```

然后在应用设置中配置外部代理URL。

#### 选项2: 使用Cloudflare Workers

部署Cloudflare Workers后,配置URL:
```
https://your-worker.your-username.workers.dev/ai-proxy
```

### 配置外部API

1. 打开部署的 GitHub Pages 应用
2. 设置 → 网络与代理
3. 云端代理URL: `https://your-api.vercel.app/api/ai-proxy`
4. 保存设置

---

## 本地开发部署

### 完整功能开发环境

```bash
# 1. 克隆项目
git clone https://github.com/yourusername/AiPiBox.git
cd AiPiBox

# 2. 安装依赖
npm install

# 3. 启动代理服务器(新终端)
npm run proxy

# 4. 启动开发服务器
npm run dev

# 或一键启动(需要安装concurrently)
npm install -g concurrently
npm run dev:full
```

### 环境自动检测

应用会自动检测本地环境,使用本地代理:
```
http://localhost:5000/api/proxy
```

### 开发工具

- Vite HMR: 热模块替换
- React DevTools: React开发工具
- 自动诊断: 开发模式自动运行

### 本地数据库(可选)

```bash
# 安装MySQL或PostgreSQL
# 创建 .env 文件
cat > .env << EOF
DATABASE_URL=mysql://root:password@localhost:3306/aipibox
DATABASE_TYPE=mysql
EOF

# 初始化数据库
npm run init-db
```

---

## 功能对比

### AI代理功能

| 平台 | 超时时间 | 流式响应 | 请求缓存 | 性能 |
|------|---------|---------|---------|------|
| Vercel | 300秒 | ✅ | ✅ | ⚡⚡⚡⚡ |
| Netlify | 300秒 | ✅ | ✅ | ⚡⚡⚡⚡ |
| Cloudflare | 无限制 | ✅ | ✅ | ⚡⚡⚡⚡⚡ |
| GitHub Pages | N/A | 需外部API | 需外部API | ⚡⚡⚡ |
| 本地开发 | 300秒 | ✅ | ✅ | ⚡⚡⚡⚡⚡ |

### 云端同步功能

| 平台 | 数据存储 | 实时同步 | 冲突解决 |
|------|---------|---------|---------|
| Vercel | MySQL/PostgreSQL | ✅ | ✅ |
| Netlify | MySQL/PostgreSQL | ✅ | ✅ |
| Cloudflare | KV/D1 | ✅ | ✅ |
| GitHub Pages | 需外部服务 | ⚠️ | ⚠️ |
| 本地开发 | 文件/数据库 | ✅ | ✅ |

### 成本估算(免费额度)

| 平台 | 带宽 | 函数调用 | 存储 | 适用场景 |
|------|------|---------|------|---------|
| Vercel | 100GB/月 | 100小时/月 | - | 个人/团队 |
| Netlify | 100GB/月 | 125k次/月 | - | 个人项目 |
| Cloudflare | 无限 | 100k次/天 | 1GB KV | 生产环境 |
| GitHub Pages | 100GB/月 | - | 1GB | 演示项目 |
| 本地开发 | 无限 | 无限 | 本地 | 开发测试 |

---

## 常见问题

### Q1: 如何切换部署平台?

A: 无需修改代码,应用会自动检测环境:
```javascript
// 自动检测平台
- Vercel: *.vercel.app
- Netlify: *.netlify.app
- Cloudflare: *.pages.dev
- GitHub Pages: *.github.io
- Local: localhost
```

### Q2: 代理API不工作怎么办?

A: 检查部署日志:
```bash
# Vercel
vercel logs

# Netlify
netlify logs

# Cloudflare
wrangler pages deployment tail
```

### Q3: 如何启用云端同步?

A: 配置数据库后:
1. 进入设置 → 安全与数据
2. 启用云端同步
3. 填写同步API地址(自动检测)
4. 保存并测试

### Q4: GitHub Pages如何使用完整功能?

A: 部署外部API服务:
1. 创建新的Vercel项目
2. 仅部署API函数
3. 在GitHub Pages应用中配置外部API URL

### Q5: 本地开发如何测试生产环境?

A: 使用preview命令:
```bash
npm run build
npm run preview
```

### Q6: 如何监控应用性能?

A:
- **Vercel**: 内置Analytics
- **Netlify**: Analytics插件
- **Cloudflare**: Workers Analytics
- **自定义**: 集成第三方APM

---

## 下一步

1. [云端代理配置](./CLOUD_PROXY_SETUP.md)
2. [云端同步配置](./CLOUD_SYNC_SETUP.md)
3. [API文档](./API.md)
4. [常见问题](./FAQ.md)

---

## 技术支持

- 📧 Email: support@aipibox.com
- 💬 Discord: [加入社区](https://discord.gg/aipibox)
- 📝 Issues: [GitHub Issues](https://github.com/yourusername/AiPiBox/issues)
- 📖 文档: [完整文档](https://docs.aipibox.com)

---

**祝您部署顺利! 🚀**
