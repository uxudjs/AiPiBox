/**
 * 云端同步数据库初始化脚本
 * 负责在目标数据库中自动创建所需的表结构与索引
 */

const { getPool, DB_CONFIG } = require('../api/db-config');

/**
 * MySQL DDL 脚本
 */
const MYSQL_SCHEMA = `
-- 核心用户表
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY COMMENT '主密码派生 ID',
  encrypted_key TEXT COMMENT '用户密钥密文',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_sync_at TIMESTAMP NULL,
  INDEX idx_last_sync(last_sync_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 同步内容存储表
CREATE TABLE IF NOT EXISTS sync_data (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  data_type VARCHAR(50) NOT NULL COMMENT '分类：config/conversations/messages 等',
  data_content MEDIUMTEXT NOT NULL COMMENT 'AES-GCM 加密后的数据体',
  version BIGINT NOT NULL COMMENT '单调递增版本号',
  checksum VARCHAR(64) COMMENT '完整性校验和',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_type(user_id, data_type),
  INDEX idx_version(version),
  INDEX idx_updated(updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 操作审计流水表
CREATE TABLE IF NOT EXISTS sync_history (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  sync_type VARCHAR(20) NOT NULL COMMENT '类型：upload/download/delete',
  data_types TEXT,
  status VARCHAR(20) NOT NULL,
  error_message TEXT,
  sync_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_sync(user_id, sync_timestamp),
  INDEX idx_status(status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

// PostgreSQL Schema
const POSTGRES_SCHEMA = `
-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  encrypted_key TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_sync_at TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_last_sync ON users(last_sync_at);

-- 同步数据表
CREATE TABLE IF NOT EXISTS sync_data (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  data_type VARCHAR(50) NOT NULL,
  data_content TEXT NOT NULL,
  version BIGINT NOT NULL,
  checksum VARCHAR(64),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_user_type ON sync_data(user_id, data_type);
CREATE INDEX IF NOT EXISTS idx_version ON sync_data(version);
CREATE INDEX IF NOT EXISTS idx_updated ON sync_data(updated_at);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sync_data_updated_at BEFORE UPDATE
ON sync_data FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 同步历史表
CREATE TABLE IF NOT EXISTS sync_history (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sync_type VARCHAR(20) NOT NULL,
  data_types TEXT,
  status VARCHAR(20) NOT NULL,
  error_message TEXT,
  sync_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_user_sync ON sync_history(user_id, sync_timestamp);
CREATE INDEX IF NOT EXISTS idx_status ON sync_history(status);
`;

/**
 * 执行数据库初始化流程
 */
async function initDatabase() {
  console.log('开始初始化数据库...');
  console.log(`数据库类型: ${DB_CONFIG.type}`);
  console.log(`数据库地址: ${DB_CONFIG.host}:${DB_CONFIG.port}`);
  console.log(`数据库名称: ${DB_CONFIG.database}`);
  console.log('');

  try {
    const pool = await getPool();
    const schema = DB_CONFIG.type === 'mysql' ? MYSQL_SCHEMA : POSTGRES_SCHEMA;

    // 分割SQL语句并执行
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`📝 执行 ${statements.length} 条SQL语句...\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement) continue;

      try {
        if (DB_CONFIG.type === 'mysql') {
          await pool.query(statement);
        } else {
          await pool.query(statement);
        }
        
        // 提取表名或操作类型用于显示
        const match = statement.match(/CREATE TABLE IF NOT EXISTS (\w+)|CREATE INDEX IF NOT EXISTS (\w+)|CREATE (?:OR REPLACE )?(?:FUNCTION|TRIGGER) (\w+)/i);
        const objectName = match ? (match[1] || match[2] || match[3]) : `Statement ${i + 1}`;
        console.log(`[DONE] ${objectName}`);
      } catch (error) {
        console.error(`[FAIL] 执行失败: ${statement.substring(0, 50)}...`);
        throw error;
      }
    }

    console.log('\n数据库初始化完成!\n');
    console.log('已创建的表:');
    console.log('  - users (用户表)');
    console.log('  - sync_data (同步数据表)');
    console.log('  - sync_history (同步历史表)');
    console.log('');

    // 验证表是否创建成功
    await verifyTables(pool);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ 数据库初始化失败:', error.message);
    console.error(error);
    process.exit(1);
  }
}

/**
 * 验证表是否创建成功
 */
async function verifyTables(pool) {
  console.log('验证表结构...\n');

  try {
    const tables = ['users', 'sync_data', 'sync_history'];

    for (const table of tables) {
      let query;
      if (DB_CONFIG.type === 'mysql') {
        query = `SELECT COUNT(*) as count FROM information_schema.tables 
                 WHERE table_schema = ? AND table_name = ?`;
        const [result] = await pool.execute(query, [DB_CONFIG.database, table]);
        if (result[0].count > 0) {
          console.log(`[CONFIRMED] 表 ${table} 存在`);
        } else {
          console.log(`[MISSING] 表 ${table} 不存在`);
        }
      } else {
        query = `SELECT COUNT(*) as count FROM information_schema.tables 
                 WHERE table_schema = 'public' AND table_name = $1`;
        const result = await pool.query(query, [table]);
        if (result.rows[0].count > 0) {
          console.log(`[CONFIRMED] 表 ${table} 存在`);
        } else {
          console.log(`[MISSING] 表 ${table} 不存在`);
        }
      }
    }

    console.log('');
  } catch (error) {
    console.error('验证失败:', error.message);
  }
}

// 如果直接运行此脚本,则执行初始化
if (require.main === module) {
  initDatabase();
}

module.exports = { initDatabase };
