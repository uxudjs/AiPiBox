# Implementation Plan

[Overview]
提高自动登录功能的密钥稳定性，减少因浏览器更新或环境微调导致的解密失败。

本实施计划旨在解决 `useAuthStore` 模块中自动登录失败（解密失败）的问题。目前系统使用 `location.origin` 和完整的 `navigator.userAgent` 派生设备密钥，由于 `userAgent` 包含高度变动的浏览器版本信息，导致浏览器更新后密钥不匹配。我们将通过简化 `userAgent` 信息来增强密钥的持久性，并优化错误处理机制。

[Types]  
本任务不涉及类型系统（TypeScript）的变更。

[Files]
修改现有文件以优化密钥派生逻辑和错误处理。

详细说明：
- `src/store/useAuthStore.js`: 修改 `deriveDeviceKey` 函数，简化密钥生成逻辑；优化 `checkInit` 中的错误捕获与记录，区分“环境变更”与“真正错误”。

[Functions]
修改密钥派生和初始化检查函数。

详细说明：
- `deriveDeviceKey` (src/store/useAuthStore.js): 修改函数实现，仅保留 `location.origin` 和 `userAgent` 中的操作系统及主要浏览器名称，剔除具体版本号。
- `checkInit` (src/store/useAuthStore.js): 修改错误捕获逻辑。若解密失败，先尝试使用简化的错误处理（logger.warn），并确保清除旧的无效凭据。

[Classes]
本任务不涉及类的变更。

[Dependencies]
无需引入新的依赖包。

[Implementation Order]
按照逻辑顺序修改认证存储模块。

1. 修改 `src/store/useAuthStore.js` 中的 `deriveDeviceKey` 函数，实现更稳定的密钥派生。
2. 修改 `src/store/useAuthStore.js` 中的 `checkInit` 函数，优化错误日志级别。
3. 验证功能：模拟 `userAgent` 变更（通过手动修改代码模拟）确认系统能优雅处理并允许用户重新登录。

task_progress Items:
- [ ] Step 1: 修改 `deriveDeviceKey` 为更稳定的实现方式
- [ ] Step 2: 优化 `checkInit` 中的错误捕获和日志记录逻辑
- [ ] Step 3: 手动验证自动登录失效时的处理流程
