# 云端数据同步部署指南

本文档介绍如何部署和配置AiPiBox的云端数据同步功能。

## 📋 目录

- [功能概述](#功能概述)
- [快速开始](#快速开始)
- [数据库设置](#数据库设置)
- [Serverless部署](#serverless部署)
- [本地测试](#本地测试)
- [API文档](#api文档)
- [故障排查](#故障排查)

---

## 功能概述

云端数据同步功能允许您:

✅ **跨设备同步**所有数据(对话、配置、知识库、图片历史等)
✅ **端到端加密**保护数据安全
✅ **增量同步**节省带宽和时间
✅ **冲突检测**自动或手动解决数据冲突
✅ **完整备份**导出/导入加密备份文件(.aipibox)

### 已实现的功能(第一阶段)

- ✅ 数据库配置和连接模块
- ✅ Serverless API端点(上传/下载/删除)
- ✅ 健康检查API
- ✅ 数据库Schema初始化脚本
- ✅ 本地完整备份和恢复功能

---

## 快速开始

### 前置条件

1. **数据库服务** - 需要一个MySQL或PostgreSQL数据库
   - 推荐: [PlanetScale](https://planetscale.com) (MySQL, 免费层)
   - 推荐: [Supabase](https://supabase.com) (PostgreSQL, 免费层)
   - 推荐: [Neon](https://neon.tech) (PostgreSQL, 免费层)

2. **Serverless平台** - 用于部署API端点
   - [Vercel](https://vercel.com) (推荐)
   - [Netlify](https://netlify.com)

### 5分钟快速部署

```bash
# 1. 安装依赖(包含数据库驱动)
npm install

# 2. 复制环境变量模板
cp .env.example .env.local

# 3. 编辑 .env.local 填入数据库配置
# (参考下面的"数据库设置"部分)

# 4. 初始化数据库表
npm run init-db

# 5. 部署到Vercel/Netlify
# (参考下面的"Serverless部署"部分)
```

---

## 数据库设置

### 选项1: PlanetScale (MySQL) 免费推荐

1. 访问 [PlanetScale](https://planetscale.com) 并创建账号
2. 创建新数据库,选择免费的Hobby计划
3. 点击 "Connect" → "Node.js" 获取连接信息
4. 在 `.env.local` 中配置:

```bash
DB_TYPE=mysql
DB_HOST=xxx.connect.psdb.cloud
DB_USER=xxx
DB_PASSWORD=pscale_pw_xxx
DB_NAME=your_database_name
DB_SSL=true
```

5. 运行初始化脚本:
```bash
npm run init-db
```

### 选项2: Supabase (PostgreSQL) 免费推荐

1. 访问 [Supabase](https://supabase.com) 并创建项目
2. 进入 Project Settings → Database
3. 复制 "Connection String" (选择 "URI" 格式)
4. 在 `.env.local` 中配置:

```bash
DB_TYPE=postgres
DB_HOST=db.xxx.supabase.co
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=postgres
DB_SSL=true
```

5. 运行初始化脚本:
```bash
npm run init-db
```

### 选项3: Neon (PostgreSQL) 免费推荐

1. 访问 [Neon](https://neon.tech) 并创建项目
2. 复制数据库连接信息
3. 在 `.env.local` 中配置
4. 运行初始化脚本

### 选项4: 本地数据库(开发环境)

如果您本地已安装MySQL或PostgreSQL:

```bash
# MySQL示例
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_local_password
DB_NAME=aipibox_sync
DB_SSL=false

# PostgreSQL示例
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_local_password
DB_NAME=aipibox_sync
DB_SSL=false
```

---

## Serverless部署

### Vercel部署(推荐)

1. **安装Vercel CLI**(可选):
```bash
npm i -g vercel
```

2. **配置环境变量**:
   - 登录 [Vercel Dashboard](https://vercel.com/dashboard)
   - 选择项目 → Settings → Environment Variables
   - 添加所有数据库配置变量(DB_TYPE, DB_HOST, 等)

3. **部署**:
```bash
vercel --prod
```

或者通过GitHub集成自动部署:
- 连接GitHub仓库到Vercel
- 推送代码后自动触发部署

4. **验证部署**:
访问 `https://your-project.vercel.app/api/health` 检查健康状态

### Netlify部署

1. **配置 netlify.toml**(已包含):
项目已包含 `netlify.toml` 配置文件

2. **配置环境变量**:
   - 登录 Netlify
   - Site settings → Build & deploy → Environment
   - 添加所有数据库配置变量

3. **部署**:
通过GitHub集成或使用Netlify CLI

4. **验证部署**:
访问 `https://your-site.netlify.app/api/health`

---

## 本地测试

### 测试健康检查API

```bash
# 确保已配置 .env.local 并初始化数据库
curl http://localhost:8888/api/health
```

预期响应:
```json
{
  "success": true,
  "status": "healthy",
  "database": "online",
  "timestamp": "2026-02-02T10:30:00.000Z",
  "version": "1.0.0"
}
```

### 测试上传API

```bash
curl -X POST http://localhost:8888/api/sync/upload \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user_123",
    "dataType": "config",
    "encryptedData": "encrypted_test_data",
    "version": 1234567890,
    "checksum": "abc123..."
  }'
```

### 测试下载API

```bash
curl "http://localhost:8888/api/sync/download?userId=test_user_123&dataType=config"
```

---

## API文档

### 端点列表

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/health` | GET | 健康检查 |
| `/api/sync/upload` | POST | 上传加密数据 |
| `/api/sync/download` | GET | 下载加密数据 |
| `/api/sync/delete` | DELETE | 删除用户数据 |

### 1. 健康检查

**请求**:
```http
GET /api/health
```

**响应**:
```json
{
  "success": true,
  "status": "healthy",
  "database": "online",
  "timestamp": "2026-02-02T10:30:00.000Z",
  "version": "1.0.0"
}
```

### 2. 上传数据

**请求**:
```http
POST /api/sync/upload
Content-Type: application/json

{
  "userId": "user_hash_id",
  "dataType": "conversations",
  "encryptedData": "base64_encrypted_content",
  "version": 12345,
  "checksum": "sha256_hash"
}
```

**有效的dataType值**:
- `config` - 用户配置
- `conversations` - 对话列表
- `messages` - 消息内容
- `images` - 图片历史
- `published` - 已发布代码
- `knowledgeBases` - 知识库
- `systemLogs` - 系统日志(可选)

**响应**:
```json
{
  "success": true,
  "version": 12346,
  "timestamp": "2026-02-02T10:30:00Z",
  "dataType": "conversations"
}
```

### 3. 下载数据

**请求**:
```http
GET /api/sync/download?userId=xxx&dataType=conversations&sinceVersion=12300
```

**查询参数**:
- `userId` (必填) - 用户ID
- `dataType` (可选) - 指定数据类型,不指定则返回所有
- `sinceVersion` (可选) - 只返回版本号大于此值的数据(增量同步)

**响应**:
```json
{
  "success": true,
  "data": [
    {
      "dataType": "conversations",
      "encryptedData": "base64_content",
      "version": 12346,
      "checksum": "sha256_hash",
      "timestamp": "2026-02-02T10:30:00Z"
    }
  ],
  "count": 1,
  "timestamp": "2026-02-02T10:30:00Z"
}
```

### 4. 删除数据

**请求**:
```http
DELETE /api/sync/delete
Content-Type: application/json

{
  "userId": "user_hash_id",
  "dataType": "conversations"  // 可选,不指定则删除所有数据
}
```

**响应**:
```json
{
  "success": true,
  "deletedCount": 5,
  "deletedTypes": ["conversations"],
  "timestamp": "2026-02-02T10:30:00Z"
}
```

---

## 数据库表结构

系统会自动创建以下3个表:

### users表
存储用户基本信息和加密密钥
```sql
- id: 用户唯一ID(基于密码派生)
- encrypted_key: 加密密钥
- created_at: 创建时间
- last_sync_at: 最后同步时间
```

### sync_data表
存储加密的同步数据
```sql
- id: 自增主键
- user_id: 用户ID
- data_type: 数据类型
- data_content: 加密的JSON数据
- version: 版本号(时间戳)
- checksum: SHA-256校验和
- created_at/updated_at: 时间戳
```

### sync_history表
记录同步操作历史
```sql
- id: 自增主键
- user_id: 用户ID
- sync_type: upload/download/delete
- data_types: 数据类型列表
- status: success/failed/partial
- error_message: 错误信息
- sync_timestamp: 同步时间
```

---

## 故障排查

### 问题1: 数据库连接失败

**症状**: `Health check failed` 或连接超时

**解决方案**:
1. 检查 `.env.local` 中的数据库配置是否正确
2. 确认数据库服务是否在线
3. 检查防火墙设置,确保允许连接
4. 如果使用SSL,确保 `DB_SSL=true`

### 问题2: 初始化数据库失败

**症状**: `npm run init-db` 报错

**解决方案**:
1. 确认数据库已创建
2. 确认用户有CREATE TABLE权限
3. 检查数据库类型(DB_TYPE)是否正确
4. 查看详细错误信息

### 问题3: API部署后无法访问

**症状**: 404或500错误

**解决方案**:
1. 检查Vercel/Netlify环境变量是否已设置
2. 查看部署日志确认是否有构建错误
3. 确认API路由配置正确
4. 访问 `/api/health` 检查服务状态

### 问题4: 本地测试无法连接

**症状**: 本地运行proxy服务器报错

**解决方案**:
1. 确认已运行 `npm install` 安装依赖
2. 检查端口8888是否被占用
3. 确认 `.env.local` 文件位置正确

---

## 安全注意事项

⚠️ **重要**: 
1. **永远不要**将 `.env.local` 提交到Git仓库
2. 使用强密码保护数据库
3. 生产环境务必启用SSL连接 (`DB_SSL=true`)
4. 定期备份数据库
5. 监控API访问日志,防止滥用

---

## 下一步计划

第一阶段(后端基础设施)已完成,接下来将实施:

- **第二阶段**: 前端同步服务增强
  - 扩展syncService.js实现云端同步
  - 增量同步逻辑
  - 冲突检测和解决
  
- **第三阶段**: UI优化
  - 同步状态显示组件
  - 同步历史记录
  - 冲突解决界面

---

## 获取帮助

如有问题,请参考:
- [主要部署文档](./DEPLOYMENT.md)
- [项目README](./README.md)
- [数据库Schema初始化脚本](./scripts/init-db.js)

---

**最后更新**: 2026-02-02
