# 云端AI代理部署指南

## 概述

AiPiBox 使用云端代理架构确保所有AI API请求的稳定性和连续性。本指南将帮助您部署云端代理服务。

## 架构说明

```
浏览器 → 云端代理API → AI服务提供商
         (Vercel/Netlify)   (OpenAI/Claude等)
```

### 优势

1. **网络稳定性**: 客户端网络中断不影响AI请求执行
2. **请求连续性**: 长连接请求在服务器端持续进行
3. **CORS解决**: 完全解决浏览器跨域限制
4. **请求缓存**: 自动缓存模型列表等重复请求
5. **错误重试**: 智能的失败重试机制

## 部署步骤

### 1. Vercel 部署 (推荐)

#### 1.1 准备工作

确保项目根目录包含以下文件:
- `vercel.json` - Vercel配置文件
- `api/ai-proxy.js` - AI代理函数
- `api/sync/` - 云端同步API
- `api/health.js` - 健康检查

#### 1.2 部署到 Vercel

**方法一: 通过 Vercel CLI**

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录 Vercel
vercel login

# 部署
vercel --prod
```

**方法二: 通过 Vercel 网页**

1. 访问 [vercel.com](https://vercel.com)
2. 点击 "New Project"
3. 导入您的 GitHub 仓库
4. 配置构建设置 (自动检测 Vite)
5. 点击 "Deploy"

#### 1.3 配置环境变量

在 Vercel 项目设置中添加:

```
DATABASE_URL=mysql://user:pass@host:3306/dbname
DATABASE_TYPE=mysql
```

#### 1.4 获取云端代理URL

部署成功后,您的代理URL为:
```
https://your-app.vercel.app/api/ai-proxy
```

### 2. Netlify 部署

#### 2.1 创建 netlify.toml

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[functions]
  node_bundler = "esbuild"

[[functions]]
  path = "api/ai-proxy.js"
  timeout = 300

[[functions]]
  path = "api/sync/*.js"
  timeout = 60

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### 2.2 部署

```bash
# 安装 Netlify CLI
npm install -g netlify-cli

# 登录
netlify login

# 部署
netlify deploy --prod
```

#### 2.3 获取云端代理URL

```
https://your-app.netlify.app/api/ai-proxy
```

### 3. 配置应用

#### 3.1 在设置中配置云端代理

1. 打开 AiPiBox 设置
2. 进入 "网络与代理" 标签
3. 启用 "使用代理"
4. 填写 "云端代理 URL": `https://your-app.vercel.app/api/ai-proxy`
5. 保存设置

#### 3.2 自动环境切换

代码会自动检测环境:
- **生产环境** (非localhost): 自动使用云端代理URL
- **开发环境** (localhost): 使用本地代理URL

### 4. 本地开发

开发时可以使用本地代理服务器:

```bash
# 启动本地代理服务器
npm run proxy

# 在另一个终端启动开发服务器
npm run dev
```

本地代理URL: `http://localhost:5000/api/proxy`

## 验证部署

### 1. 健康检查

访问: `https://your-app.vercel.app/api/health`

应返回:
```json
{
  "status": "ok",
  "version": "1.0.0",
  "time": "2026-02-02T10:30:00.000Z"
}
```

### 2. 测试AI请求

1. 在AiPiBox中配置API Key
2. 发送测试消息
3. 检查浏览器Network标签,确认请求发送到云端代理

## 监控和调试

### 查看日志

**Vercel:**
```bash
vercel logs
```

**Netlify:**
在 Netlify Dashboard 中查看 Functions 日志

### 常见问题

#### 1. 请求超时

云端代理支持最长5分钟的请求。如果仍然超时:
- 检查AI服务提供商状态
- 验证API Key是否正确
- 检查Base URL配置

#### 2. 404 错误

确保:
- `api/ai-proxy.js` 文件存在
- Vercel/Netlify 正确识别为 Serverless Function
- 部署日志没有错误

#### 3. 请求被拦截

检查:
- 云端代理URL是否正确配置
- 浏览器控制台是否有CORS错误
- 网络请求是否发送到云端URL

## 性能优化

### 1. 请求缓存

系统自动缓存:
- 模型列表 (1小时)
- 固定seed的图像生成结果

### 2. 连接池

云端代理自动管理连接池,无需额外配置。

### 3. 区域配置

**Vercel:**
在 `vercel.json` 中指定区域:
```json
{
  "regions": ["sfo1", "hnd1"]
}
```

**Netlify:**
在 `netlify.toml` 中配置:
```toml
[functions]
  included_files = ["api/**"]
```

## 安全建议

1. **API Key加密**: 所有API Key通过HTTPS传输,服务器端不存储
2. **请求日志**: 敏感头部信息自动掩码
3. **速率限制**: 建议在Vercel/Netlify配置速率限制
4. **环境变量**: 数据库凭据存储在环境变量中

## 成本估算

### Vercel (Hobby Plan)

- 免费额度: 100GB带宽/月, 100小时函数执行时间
- 适用场景: 个人使用, 中小团队
- 超出额度按使用量计费

### Netlify (Free Plan)

- 免费额度: 100GB带宽/月, 125k函数调用/月
- 适用场景: 个人项目
- 函数执行时间限制: 10秒 (付费计划可扩展到300秒)

## 下一步

1. [配置数据库](./CLOUD_SYNC_SETUP.md) - 启用云端数据同步
2. [部署生产环境](./DEPLOYMENT.md) - 完整部署指南
3. [监控设置](./MONITORING.md) - 设置监控告警

## 技术支持

遇到问题? 检查:
1. [常见问题](./FAQ.md)
2. [GitHub Issues](https://github.com/yourusername/AiPiBox/issues)
3. [Discord社区](https://discord.gg/aipibox)
