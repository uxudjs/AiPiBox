# 安全漏洞修复实施计划

**来源规格:** specs/security-fix-spec.md
**日期:** 2026-06-03

---

## 依赖关系图

所有 7 个修复之间**无代码依赖关系**，可以任意顺序实施：

```
Fix-1 (SSRF)       ─┐
Fix-2 (Auth)       ─┤
Fix-3 (Salt)       ─┤
Fix-4 (Logger)     ─┼──→ 无相互依赖，可并行
Fix-5 (FileUpload) ─┤
Fix-6 (iframe)     ─┤
Fix-7 (Math.random)─┘
```

唯一需要注意的：`api/` 和 `functions/api/` 是两套独立的 Serverless 运行时副本，涉及 API 端的修复需要在两处同步变更。

## 实施顺序

按优先级分组，P0 → P1 → P2：

```
Phase 1 (P0):  Fix-1 (SSRF) + Fix-2 (Auth)
               ↓ 验证检查点
Phase 2 (P1):  Fix-3 (Salt) + Fix-4 (Logger) + Fix-5 (FileUpload)
               ↓ 验证检查点
Phase 3 (P2):  Fix-6 (iframe) + Fix-7 (Math.random)
               ↓ 最终验证
```

Phase 内可并行执行（无冲突文件）。

## 风险矩阵

| 修复 | 风险 | 级别 | 缓解措施 |
|------|------|------|---------|
| Fix-1 SSRF | 误拦截合法子域名 | 中 | 充分测试白名单域名变体 |
| Fix-2 Auth | 速率限制误伤正常用户 | 中 | 设置合理阈值 (5/min) |
| Fix-3 Salt | 破坏已有云端同步数据 | 高 | 向后兼容 fallback 逻辑 |
| Fix-4 Logger | 正则误匹配正常内容 | 低 | 精确匹配模式 |
| Fix-5 FileUpload | 误拒绝合法文件 | 中 | 只检查已知魔数 |
| Fix-6 iframe | 破坏代码预览渲染 | 低 | 测试 HTML/CSS/JS 预览 |
| Fix-7 Random | crypto API 兼容性 | 低 | Node 19+ 内置，浏览器 HTTPS |

## 验证检查点

### 检查点 1 (Phase 1 完成)
- [ ] SSRF 域名白名单逻辑正确性（手动测试 5 个测试用例）
- [ ] Auth 时序安全比较 + 速率限制功能
- [ ] Node.js 和 Cloudflare Workers 双端一致

### 检查点 2 (Phase 2 完成)
- [ ] 新 salt 逻辑：新用户新格式，旧用户兼容
- [ ] 日志脱敏覆盖全部格式
- [ ] 文件上传魔法数字检测正确

### 检查点 3 (Phase 3 完成)
- [ ] iframe 代码预览正常工作
- [ ] 所有 Math.random() 替换完成
- [ ] 构建无错误

### 最终检查点
- [ ] 全量代码审查
- [ ] 构建通过
- [ ] 不破坏现有功能
