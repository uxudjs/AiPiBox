# Spec: AiPiBox 安全漏洞修复

**版本:** 1.0
**日期:** 2026-06-03
**来源:** security-audit-report.md (7 个已确认漏洞)

---

## Objective

修复安全审计报告中确认的 7 个安全漏洞，覆盖 SSRF 防护、认证加固、密钥派生安全、日志脱敏、文件上传校验、iframe 沙箱和随机数安全性。

**用户:** AiPiBox 的所有使用者
**成功标准:** 每个漏洞的修复通过了代码审查级别的验证，且不破坏现有功能

---

## Tech Stack

- 前端: React 18.2 + Vite 5.x + Zustand 4.4 + TailwindCSS
- 后端 API: Node.js Express (Vercel/Netlify Serverless)
- Workers: Cloudflare Workers (独立副本)
- 加密: Web Crypto API (PBKDF2, AES-GCM)
- 数据库: Dexie.js (IndexedDB)

---

## Commands

```
Build:   cd functions && npm install && npm run build   (如果有构建脚本)
Dev:     npm run dev
Lint:    npx eslint src/ api/ --fix   (如果配置了 ESLint)
Test:    无自动化测试套件 — 通过浏览器人工验证
```

---

## Project Structure

```
api/               → Node.js Serverless API handlers
  auth.js          → HMAC + global auth
  ai-proxy.js      → AI 请求代理 (SSRF 修复目标)
  sync/            → 云端同步 API
functions/api/     → Cloudflare Workers 副本 (与 api/ 同步修复)
src/
  services/
    logger.js      → 日志脱敏 (修复目标)
    syncService.js → 云端同步客户端 (盐值修复目标)
    aiService.js   → AI 服务客户端 (auth header)
  components/chat/
    hooks/
      useFileHandler.js → 文件上传 (修复目标)
    PublishedPage.jsx   → iframe sandbox (修复目标)
    MarkdownRenderer.jsx → iframe sandbox (修复目标)
  store/
    useConfigStore.js   → 状态管理 (accessCode)
```

---

## Code Style

遵循项目现有风格：ES Module imports、JSDoc 注释、中文日志、箭头函数。示例：

```javascript
// 修复前 (SSRF)
const isAllowed = ALLOWED_HOSTS.some(allowed =>
  targetHost === allowed || targetHost.endsWith('.' + allowed)
);

// 修复后 — 组件级别域名匹配
const isAllowed = ALLOWED_HOSTS.some(allowed =>
  targetHost === allowed ||
  (targetHost.endsWith('.' + allowed) &&

   !targetHost.slice(0, -allowed.length - 1).includes('.'))
);
```

---

## Testing Strategy

- 无自动化测试框架
- 验证方式: 构建通过 + 浏览器功能验证 + 代码审查
- 重点验证: 修复不破坏现有 AI 请求、文件上传、云端同步功能

---

## Boundaries

- **Always:** 修复必须精确，不引入新漏洞；保持向后兼容
- **Ask first:** 添加新依赖（如 bcrypt、DOMPurify）；修改加密协议（改变数据格式）
- **Never:** 删除现有安全措施；禁用 CSP/rehype-sanitize 等防护

---

## 修复项详细规格

### Fix-1: SSRF 域名白名单绕过 (P0)

**目标:** 防止攻击者通过构造域名绕过 `endsWith` 检查
**文件:** `api/ai-proxy.js:192`, `functions/api/ai-proxy.js` (同步修复)

**验收标准:**
- `evil.openai.com.attacker.com` → 拒绝
- `api.openai.com` → 允许
- `sub.api.openai.com` → 允许
- `fakeopenai.com` → 拒绝 (此前会被拒绝，修复后仍被拒绝)
- `openai.com.evil.com` → 拒绝

**实现方案:** 检查域名末尾匹配时，确保匹配边界在域名组件的 `.` 分隔符处。

---

### Fix-2: 全局访问密码安全加固 (P0)

**目标:** 保护 AUTH_SECRET 在传输和存储中的安全
**文件:** `api/auth.js:120-134`, `functions/api/auth.js`

**验收标准:**
- 密码不再通过纯文本 `!==` 比较
- 添加独立速率限制防止暴力破解
- 客户端 localStorage 中的 accessCode 不再被 Zustand persist 明文存储

**实现方案:**
1. 服务端：使用 `crypto.timingSafeEqual` 替代 `!==`，防止时序攻击
2. 服务端：为 `verifyGlobalAuth` 添加独立速率限制（5次/分钟/IP）
3. 客户端：accessCode 从 Zustand persist 黑名单中排除（不持久化到 localStorage）

**注意:** HMAC 挑战响应方案（审计报告建议）改动量过大且需要修改客户端协议，本次修复采用时序安全比较 + 速率限制作为最低安全基线。

---

### Fix-3: PBKDF2 固定盐值替换 (P1)

**目标:** 使用随机盐值增强密钥派生安全性
**文件:** `src/services/syncService.js:182-200`

**验收标准:**
- 新生成的 syncId 使用随机盐值
- 已有用户的旧 syncId 仍然有效（向后兼容）
- 随机盐值随派生结果一起存储，供后续验证

**实现方案:**
1. 生成 16 字节随机盐值
2. 将盐值 hex 编码后与前缀拼接：`{salt_hex}:{derived_id}`
3. 验证时从存储格式中解析盐值和 ID
4. 对于已有数据（不含 salt 前缀的旧格式），fallback 使用固定盐值

---

### Fix-4: 日志脱敏规则完善 (P1)

**目标:** 覆盖所有主流 API Key 格式
**文件:** `src/services/logger.js:91`

**验收标准:**
- `AIzaSy...` → 脱敏
- `sk-ant-api...` → 脱敏
- `sk-proj-...` → 脱敏
- `sk-...` → 脱敏
- Bearer token → 脱敏
- Azure UUID Key → 脱敏

**实现方案:** 添加多个预编译正则表达式，逐个匹配替换。

---

### Fix-5: 文件上传内容校验 (P1)

**目标:** 不仅检查 MIME 类型，还检查文件魔术字节
**文件:** `src/components/chat/hooks/useFileHandler.js`

**验收标准:**
- 伪装成图片的非图片文件 → 拒绝
- 正常 PNG/JPEG/GIF/WebP → 接受
- SVG 文件 → 接受但通过 DOMPurify 净化
- 图片处理：使用 Canvas 重新编码（移除潜在恶意元数据）

**实现方案:**
1. 添加魔术字节检测函数（检查文件头几个字节）
2. 图片文件通过 Canvas 重新编码为 dataURL，剥离原始二进制
3. SVG 文件检测 `</script>` 等危险标签

---

### Fix-6: iframe sandbox 安全加固 (P2)

**目标:** 限制 iframe 内代码的能力
**文件:** `src/components/chat/PublishedPage.jsx:65`, `src/components/chat/MarkdownRenderer.jsx:122`

**修正审计报告建议:** 报告建议加 `allow-same-origin` — 实际上这会**降低安全性**（允许 iframe 访问同源资源）。当前 `allow-scripts` 无 `allow-same-origin` 是正确配置。

**验收标准:**
- iframe 保持 `sandbox="allow-scripts"`（不添加 allow-same-origin）
- 添加 `csp` 属性限制脚本来源

**实现方案:**
- 保持当前 sandbox 配置
- 为 MarkdownRenderer 的 iframe 添加 `csp="default-src 'self'; script-src 'unsafe-inline'; style-src 'unsafe-inline'"` 属性
- 为 PublishedPage 的 iframe 同样添加 CSP

---

### Fix-7: 数学随机数替换为加密安全随机数 (P2)

**目标:** 所有非安全随机数替换为 crypto API
**文件:** 共 6 处

| 位置 | 用途 | 替换 |
|------|------|------|
| `api/ai-proxy.js:67` | 清理概率 | `crypto.randomInt(100)` |
| `api/ai-proxy.js:156` | 请求 ID | `crypto.randomUUID()` |
| `functions/api/ai-proxy.js:67,160` | 同上 | 同上 |
| `src/components/chat/hooks/useFileHandler.js:48` | 文件 ID | `crypto.randomUUID()` |
| `src/components/chat/InputArea.jsx:253` | 图片 ID | `crypto.randomUUID()` |
| `src/components/chat/MarkdownRenderer.jsx:69` | 元素 ID | `crypto.randomUUID()` |
| `src/components/chat/MermaidRenderer.jsx:100` | 元素 ID | `crypto.randomUUID()` |
| `src/services/aiService.js:1201` | seed 生成 | `crypto.getRandomValues` |

**验收标准:**
- 不再有 `Math.random()` 用于 ID 或安全相关场景
- 速率限制清理逻辑中的 `Math.random()` 替换为 `crypto.randomInt()`
- Node.js 端使用 `crypto.randomUUID()` (Node 19+ 内置) 或 `crypto.randomBytes()`

---

## Success Criteria (总体)

1. [ ] 所有 7 个修复的代码通过人工审查
2. [ ] 构建无错误 (`npm run build` 如果存在)
3. [ ] SSRF 绕过测试用例通过
4. [ ] 不破坏现有 AI 代理、文件上传、云端同步功能
5. [ ] 向后兼容：已有用户数据不受影响

## Open Questions

1. **Q:** syncId 盐值随机化后，已有云端数据如何迁移？
   **A:** 不迁移。旧格式 syncId 继续有效，新用户使用新格式。旧用户在下次修改密码时可选择重新生成。

2. **Q:** Cloudflare Workers 的 `functions/api/` 副本是否需要同步修复？
   **A:** 是。凡是 `api/` 下修改的文件，对应 `functions/api/` 下的副本需同步修复。

3. **Q:** AUTH_SECRET 是否需要从环境变量改为 bcrypt 哈希？
   **A:** 环境变量方案保持（便于 Serverless 部署），但比较方式改为 timingSafeEqual。完整 HMAC 挑战响应留待后续版本。
