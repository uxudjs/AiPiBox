# AiPiBox 代码审计与安全评估报告

**审计日期:** 2026-06-03  
**审计范围:** AiPiBox 全栈代码库（前端 React + Serverless API）  
**审计方法:** 静态代码分析、依赖审查、架构安全评估  
**风险评级:** 🔴 严重 | 🟠 高危 | 🟡 中危 | 🟢 低危 | 🔵 信息

> **历史快照：** 本报告记录 2026-06-03 的代码状态。自 2026-07-15 起，Node/Vercel/Netlify 后端已退役；文中的 `api/` 路径仅作为历史证据保留，当前生产实现位于 `functions/api/`。

---

## 执行摘要

AiPiBox 是一个基于 React + Vite 的 AI 对话客户端，支持多模型提供商、本地数据加密存储、云端同步及文档解析等功能。整体架构设计合理，采用了客户端加密、服务端无状态设计等安全实践。但审计发现 **7 个安全问题**，包括 2 个高危、3 个中危和 2 个低危问题，需在上线前修复。

| 风险等级 | 数量 | 状态 |
|---------|------|------|
| 🔴 严重 | 0 | - |
| 🟠 高危 | 2 | 待修复 |
| 🟡 中危 | 3 | 建议修复 |
| 🟢 低危 | 2 | 可选修复 |
| 🔵 信息 | 3 | 参考 |

---

## 🔴 高危问题

### 1. SSRF 防护绕过风险（ai-proxy.js）

**文件:** `api/ai-proxy.js`  
**问题描述:** 目标 URL 白名单校验存在逻辑缺陷。代码使用 `targetHost.endsWith('.' + allowed)` 进行子域匹配，但此实现可被绕过：

```javascript
// 存在问题的代码 (第 75-80 行)
const isAllowed = ALLOWED_HOSTS.some(allowed =>
  targetHost === allowed || targetHost.endsWith('.' + allowed)
);
```

**利用路径:**
- 攻击者可构造 `evil-api.openai.com.attacker.com` 这样的域名
- `endsWith('.openai.com')` 会返回 `true`，但实际请求会发送到攻击者控制的域名
- 配合 `stream=true` 可实现长连接数据窃取或内网探测

**修复建议:**
```javascript
const isAllowed = ALLOWED_HOSTS.some(allowed => {
  // 精确匹配或严格子域匹配（确保点是域名分隔符）
  return targetHost === allowed || 
         targetHost.endsWith('.' + allowed) && 
         !targetHost.slice(0, -allowed.length - 1).includes('.');
});
```

**影响:** 攻击者可利用此漏洞绕过代理访问任意内网服务或外网恶意站点，窃取 API Key 或进行内网扫描。

---

### 2. 全局访问密码明文传输与存储

**文件:** `api/auth.js`, `src/services/aiService.js`, `src/services/syncService.js`  
**问题描述:** 

1. `AUTH_SECRET` 通过 HTTP Header `X-Authorization` 明文传输
2. 客户端 `proxy.accessCode` 存储在 localStorage（通过 Zustand 持久化）
3. 服务端使用简单字符串比较：`authHeader !== secret`

```javascript
// api/auth.js (第 115-120 行)
function verifyGlobalAuth(req, res) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return true;
  const authHeader = req.headers['x-authorization'];
  if (!authHeader || authHeader !== secret) {
    res.status(401).json({...});
    return false;
  }
}
```

**风险:**
- 中间人攻击可直接窃取访问密码
- 无速率限制，可暴力破解
- 密码在服务端内存中以明文形式存在

**修复建议:**
1. 使用 HMAC-SHA256 挑战响应机制替代明文传输
2. 对 `verifyGlobalAuth` 添加独立速率限制
3. 考虑使用 JWT 或 API Key 方案
4. 服务端密码使用 bcrypt 哈希存储

---

## 🟡 中危问题

### 3. 客户端加密密钥派生使用固定盐值

**文件:** `src/services/syncService.js` (第 115-130 行)  
**问题描述:** `getSyncId()` 函数使用固定盐值派生同步 ID：

```javascript
const fixedSalt = new TextEncoder().encode("AiPiBox_Cloud_Sync_ID_v1");
```

**风险:**
- 固定盐值降低了 PBKDF2 的安全性
- 相同密码始终生成相同的 syncId
- 若数据库泄露，攻击者可进行预计算攻击（Rainbow Table）

**修复建议:**
```javascript
// 使用随机盐值，并将盐值与加密数据一起存储
const salt = crypto.getRandomValues(new Uint8Array(16));
// 将 salt 与派生结果一并存储/传输
```

---

### 4. 日志脱敏规则不完整

**文件:** `src/services/logger.js` (第 85 行)  
**问题描述:** 日志脱敏正则表达式仅覆盖部分 API Key 格式：

```javascript
const sanitizedContent = content.replace(
  /(sk-proj-|sk-|key-|api_key=|Authorization:|Bearer\s)[a-zA-Z0-9_\-\.]{10,}/gi, 
  '$1[REDACTED]'
);
```

**遗漏场景:**
- Google Gemini API Key (`AIzaSy...` 格式)
- Anthropic API Key (`sk-ant-api...` 格式)
- Azure OpenAI Key (32 位十六进制)
- 自定义提供商的 API Key
- 私钥、密码等其他敏感信息

**修复建议:**
```javascript
const SENSITIVE_PATTERNS = [
  // OpenAI
  /(sk-(?:proj-|ant-api)?)[a-zA-Z0-9_-]{10,}/gi,
  // Google
  /(AIzaSy)[a-zA-Z0-9_-]{10,}/gi,
  // Azure
  /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/gi,
  // Generic Bearer
  /(Bearer\s+)[a-zA-Z0-9_\-\.]{10,}/gi,
  // Generic API Key
  /(api[_-]?key[=:]\s*)[a-zA-Z0-9_\-\.]{8,}/gi,
];
```

---

### 5. 文件上传 MIME 类型校验不足

**文件:** `src/components/chat/FileUpload.jsx`, `src/components/chat/hooks/useFileHandler.js`  
**问题描述:** 文件上传仅依赖 `file.type` 和扩展名校验，未进行实际内容检测：

```javascript
// useFileHandler.js (第 45 行)
if (!file.type.startsWith('image/')) continue;
```

**风险:**
- 攻击者可修改文件扩展名绕过限制
- 可上传伪装成图片的恶意文件（如包含 XSS payload 的 SVG）
- 文档解析器可能处理恶意构造的文件导致 XSS 或 DoS

**修复建议:**
1. 对上传文件进行魔术字节（Magic Bytes）校验
2. 图片文件使用 Canvas 重新编码后再存储
3. 对 SVG 文件进行内容净化（DOMPurify）
4. 设置严格的 CSP 策略防止内联脚本执行

---

## 🟢 低危问题

### 6. 发布页面 iframe sandbox 配置过于宽松

**文件:** `src/components/chat/PublishedPage.jsx`, `src/components/chat/MarkdownRenderer.jsx`  
**问题描述:** 代码预览 iframe 仅设置 `sandbox="allow-scripts"`：

```jsx
<iframe 
  srcDoc={srcDoc} 
  className="w-full h-full border-none"
  title="published-content"
  sandbox="allow-scripts"
/>
```

**风险:**
- 允许脚本执行意味着 XSS payload 可运行
- 恶意代码可访问同源资源（如果部署在根域名）
- 可进行点击劫持、钓鱼等攻击

**修复建议:**
```jsx
<iframe 
  srcDoc={srcDoc}
  sandbox="allow-scripts allow-same-origin"
  // 添加 CSP 头
  csp="default-src 'self'; script-src 'unsafe-inline';"
/>
```

---

### 7. 随机数生成器使用非加密安全版本

**文件:** `src/store/useFileStore.js` (第 32 行)  
**问题描述:**

```javascript
const fileId = `${Date.now()}_${file.name}`;
```

以及多处使用 `Math.random()`：
- `useAuthStore.js` 中的 `Math.random()` 用于生成 ID
- `ai-proxy.js` 中的 `Math.random()` 用于请求 ID

**风险:**
- `Math.random()` 不是加密安全的随机数生成器
- 文件 ID 可预测，可能导致信息泄露或竞态条件

**修复建议:**
```javascript
const fileId = `${Date.now()}_${crypto.randomUUID()}`;
// 或使用
const fileId = `${Date.now()}_${Array.from(crypto.getRandomValues(new Uint8Array(8))).map(b => b.toString(16).padStart(2, '0')).join('')}`;
```

---

## 🔵 信息项

### 8. 依赖项安全状态

| 依赖 | 版本 | 状态 | 说明 |
|------|------|------|------|
| axios | 1.6.2 | ⚠️ | 建议升级到 1.7.x，修复多个安全漏洞 |
| express | 4.18.2 | ⚠️ | 建议升级到 4.19.x+ |
| pdfjs-dist | 3.11.174 | ✅ | 当前版本安全 |
| react | 18.2.0 | ✅ | 当前版本安全 |
| vite | 5.0.0 | ⚠️ | 建议升级到 5.1.x+ |
| zustand | 4.4.6 | ✅ | 当前版本安全 |

**建议:** 运行 `npm audit` 并修复所有高危漏洞。

---

### 9. 安全头部缺失

**文件:** `api/ai-proxy.js`  
**问题描述:** API 响应缺少安全头部：

缺失头部：
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Content-Security-Policy`
- `Strict-Transport-Security` (HSTS)
- `Referrer-Policy`

**修复建议:**
```javascript
res.setHeader('X-Content-Type-Options', 'nosniff');
res.setHeader('X-Frame-Options', 'DENY');
res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
```

---

### 10. 数据库 Schema 版本迁移潜在数据丢失

**文件:** `src/db/index.js`  
**问题描述:** 版本升级逻辑在 `VersionError` 时会删除整个数据库：

```javascript
Dexie.delete('AiPiBoxDB').then(() => {
  window.location.reload();
});
```

**风险:**
- 用户数据全部丢失
- 无备份提醒机制

**建议:**
- 在删除前导出数据备份
- 提供用户确认对话框
- 实现更优雅的数据迁移机制

---

## 架构安全评估

### ✅ 安全实践（值得肯定）

1. **客户端端到端加密**: 用户数据使用 AES-GCM + PBKDF2 加密，服务端仅存储密文
2. **无状态认证**: 使用 HMAC-SHA256 进行请求签名，无需服务端存储会话
3. **速率限制**: ai-proxy 实现了基于 IP 的内存速率限制
4. **CSP 防护**: Markdown 渲染使用 rehype-sanitize 进行 HTML 净化
5. **输入校验**: syncId 使用正则表达式校验格式和长度
6. **错误处理**: 统一的错误处理，避免敏感信息泄露

### ⚠️ 需要改进

1. **传输安全**: 缺少 HTTPS 强制跳转和 HSTS
2. **审计日志**: 缺少安全事件审计日志（如登录失败、权限变更）
3. **数据备份**: 加密数据缺少备份恢复机制
4. **密钥管理**: API Key 存储在客户端内存，存在 XSS 泄露风险

---

## 修复优先级建议

| 优先级 | 问题 | 预计工作量 |
|--------|------|-----------|
| P0 | SSRF 防护绕过 | 2 小时 |
| P0 | 全局访问密码安全加固 | 4 小时 |
| P1 | 客户端加密盐值随机化 | 2 小时 |
| P1 | 日志脱敏规则完善 | 1 小时 |
| P1 | 文件上传内容校验 | 4 小时 |
| P2 | iframe sandbox 加固 | 1 小时 |
| P2 | 随机数生成器替换 | 1 小时 |
| P2 | 安全头部补充 | 1 小时 |

---

## 附录：审计检查清单

- [x] 认证与授权机制
- [x] 数据加密与密钥管理
- [x] 输入校验与 sanitization
- [x] SSRF / 请求走私防护
- [x] XSS 防护（反射型/存储型/DOM）
- [x] CSRF 防护
- [x] 依赖项安全
- [x] 日志与监控
- [x] 错误处理
- [x] 传输安全
- [x] 文件上传安全
- [x] 第三方组件安全

---

*报告生成时间: 2026-06-03*  
*审计工具: 静态代码分析 + 人工审查*
