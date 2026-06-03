# 安全漏洞修复任务列表

## Phase 1: P0 高危修复

### Task 1.1: SSRF 域名白名单绕过修复
- **文件:** `api/ai-proxy.js:192`, `functions/api/ai-proxy.js` (同步)
- **变更:** 将 `endsWith` 域名匹配替换为基于 . 分隔的组件级精确匹配
- **验收:** 6 个边界测试用例通过 (evil.openai.com.attacker.com→拒绝, api.openai.com→允许, sub.api.openai.com→允许, fakeopenai.com→拒绝, openai.com.evil.com→拒绝, openai.azure.com→允许Azure)
- **验证:** 代码审查域名匹配逻辑
- **风险:** 中 — 可能误拦合法子域名

### Task 1.2: 全局访问密码安全加固
- **文件:** `api/auth.js:120-134`, `functions/api/auth.js`
- **变更:**
  1. 替换 `!==` 为 `crypto.timingSafeEqual` (防时序攻击)
  2. 添加独立内存速率限制器 (5次/分钟/IP)
  3. 将 accessCode 从 Zustand persist 中排除
- **验收:** 时序安全比较生效；错误密码快速达到速率限制；accessCode 不持久化
- **验证:** 手动测试 auth 流程
- **风险:** 中 — 速率限制可能误伤正常用户

---

## Phase 2: P1 中危修复

### Task 2.1: PBKDF2 随机盐值
- **文件:** `src/services/syncService.js:182-200`
- **变更:** 生成随机 16 字节盐值，输出格式 `{salt_hex}:{derived_id}`；旧格式 fallback
- **验收:** 新 syncId 含随机盐值前缀；旧 syncId 仍然有效
- **验证:** 新旧两种格式均能正常同步
- **风险:** 高 — 可能破坏已有云端同步

### Task 2.2: 日志脱敏规则完善
- **文件:** `src/services/logger.js:91`
- **变更:** 添加 Gemini、Anthropic、Azure、通用 Bearer/API Key 正则
- **验收:** AIzaSy..., sk-ant-api..., Bearer token, Azure UUID 格式均脱敏
- **验证:** 控制台日志中无明文 API Key
- **风险:** 低

### Task 2.3: 文件上传魔术字节校验
- **文件:** `src/components/chat/hooks/useFileHandler.js`
- **变更:** 添加魔术字节检测函数；图片通过 Canvas 重编码；SVG 检测危险标签
- **验收:** 伪装图片被拒绝；正常 PNG/JPEG/GIF/WebP 通过
- **验证:** 上传各类文件测试
- **风险:** 中 — 可能误拒合法文件

---

## Phase 3: P2 低危修复

### Task 3.1: iframe CSP 安全加固
- **文件:** `src/components/chat/PublishedPage.jsx:65`, `src/components/chat/MarkdownRenderer.jsx:122`
- **变更:** 添加 `csp` 属性限制脚本和样式来源（不添加 allow-same-origin）
- **验收:** 代码预览正常渲染；CSP 策略生效
- **验证:** HTML/CSS/JS 代码块预览功能正常
- **风险:** 低

### Task 3.2: Math.random 替换为加密安全随机数
- **文件:** 6 个文件 (见规格说明)
- **变更:** `Math.random()` → `crypto.randomUUID()` 或 `crypto.randomInt()`
- **验收:** 所有 ID 生成和随机逻辑使用 crypto API
- **验证:** 构建通过 + 功能回归
- **风险:** 低 — crypto.randomUUID 在非 HTTPS localhost 可能不可用
