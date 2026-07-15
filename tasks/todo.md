# AiPiBox 发布阻断修复清单

详细验收标准见 `tasks/plan.md`。未通过检查点，不进入下一阶段。

## 决策门

- [x] D0：确认正式后端仅保留 Cloudflare Pages Functions + KV。
- [ ] D1：确认 Excel 暂时禁用；如必须保留，批准 SheetJS 官方 tarball 方案。
- [ ] D2：确认新设备恢复使用“主密码 + 32 位十六进制同步代码”。
- [ ] 用户已审阅并批准本计划。

## Phase 1：可复现基线

- [ ] T01：补 `jsdom`、提交 lockfile、停止忽略 lockfile。

### Checkpoint 1

- [ ] `npm ci` 成功。
- [ ] Vitest 可完成测试收集，不再报缺少 `jsdom`。
- [ ] `npm run build` 成功。
- [ ] 所有已知失败均有对应任务。

## Phase 2：P0 安全

- [ ] T02：删除 Markdown 的 iframe/srcDoc/style 放行并测试生产渲染器。
- [ ] T03：Mermaid 改 strict，隔离 PublishedPage sandbox/CSP。
- [ ] T04：升级 PDF.js；按决策禁用或安全替换 xlsx。
- [ ] T05：Cloudflare AI proxy 强制 HTTPS/许可主机/禁止重定向。
- [ ] T06：本地 proxy 仅 loopback、限制 CORS/本地端口/taskId。
- [ ] T07：删除可逆的多日持久登录。
- [ ] T08：裸 SHA-256 verifier 迁移到带盐 PBKDF2。
- [ ] T09：移除 CSP 的 `unsafe-inline/unsafe-eval` 脚本权限和 `connect-src *`。

### Checkpoint A

- [ ] P0 安全测试直接覆盖生产实现且全绿。
- [ ] `npm test`、`npm run build` 通过。
- [ ] `npm audit --omit=dev --audit-level=high` 通过。
- [ ] 恶意 Markdown、Mermaid、发布页、Cloudflare proxy、本地 proxy smoke 通过。

## Phase 3：Cloudflare 同步主路径

- [ ] T10：修复 `syncFromCloud()` 未声明 `cloudSync`。
- [ ] T11：为现有随机 salt 增加同步代码导入/导出契约。
- [ ] T12：设置页完成同步代码复制/导入及五语言说明。
- [ ] T13：AUTH_SECRET 仅失败限流，缺少配置 fail closed。
- [ ] T14：统一 10 MB 密文边界，health 验证 `SYNC_DATA`/`AUTH_SECRET`。

### Checkpoint B

- [ ] 同步、认证、health 专项测试全绿。
- [ ] 设备 A 上传 → 设备 B 下载/修改/上传 → 设备 A 再下载成功。
- [ ] 连续正确请求不产生意外 429。
- [ ] 10 MB 边界两侧行为正确。

## Phase 4：删除 Node/SQL 重复路径

- [ ] T15A：删除 Vercel/Netlify/init-db scripts、SQL 依赖和部署配置。
- [ ] T15B：删除 Node sync handler、DB adapter、初始化脚本。
- [ ] T15C：删除其余 Node AI/auth/health handler。
- [ ] T15D：更新 `.env.example` 与五语言 README 支持矩阵。

### Checkpoint C

- [ ] `rg --files api` 无结果。
- [ ] Cloudflare 正式路径和本地 proxy 均可运行。
- [ ] `npm ci`、`npm test`、`npm run build` 全绿。
- [ ] 文档、npm scripts、依赖与实际支持范围一致。

## Phase 5：数据、无障碍与发布门禁

- [ ] T16：选择、粘贴、拖放图片统一经过生产校验。
- [ ] T17：清除所有 Dexie 表和 AiPiBox 自有浏览器存储键。
- [ ] T18：修复 JSON `apiKey` 等日志脱敏并删除测试副本。
- [ ] T19：恢复缩放并补齐登录 label/错误播报/键盘流程。
- [ ] T20：核心 Modal 补 dialog、Escape、焦点约束与恢复。
- [ ] T21：Sidebar 与 Cloudflare health 读取 package 版本。
- [ ] T22：新增最小 GitHub CI，并设为 required check。

### Checkpoint D：最终发布候选

- [ ] `npm ci`
- [ ] `npm test`
- [ ] `npm run build`
- [ ] `npm audit --omit=dev --audit-level=high`
- [ ] `git diff --check`
- [ ] 两设备同步、清除数据、三种图片入口、恶意内容和键盘 smoke 全部通过。
- [ ] 再次执行 ship review，结论为 GO。

## 条件式后续

- [ ] T23：仅当首屏 Network 实测加载 PDF/Office/Mermaid 大 chunk 时做动态导入。
