/**
 * 数据库配置与连接模块
 * 适配 Serverless 环境，支持 MySQL 与 PostgreSQL
 */

/**
 * 数据库配置参数
 * 优先从环境变量读取
 */
const DB_CONFIG = {
  // 数据库引擎类型: 'mysql' | 'postgres'
  type: process.env.DB_TYPE || 'mysql',
  
  // 网络连接信息
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || (process.env.DB_TYPE === 'postgres' ? 5432 : 3306),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  
  // 连接池设置
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
  
  // SSL 安全连接配置
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false
  } : false
};

/**
 * 数据库连接池实例（懒加载）
 */
let pool = null;

/**
 * 获取或创建数据库连接池
 * @returns {Promise<Object>} 数据库连接池
 */
async function getPool() {
  if (pool) {
    return pool;
  }

  const dbType = DB_CONFIG.type;

  if (dbType === 'mysql') {
    // MySQL 连接
    const mysql = require('mysql2/promise');
    pool = mysql.createPool({
      host: DB_CONFIG.host,
      port: DB_CONFIG.port,
      database: DB_CONFIG.database,
      user: DB_CONFIG.user,
      password: DB_CONFIG.password,
      connectionLimit: DB_CONFIG.connectionLimit,
      ssl: DB_CONFIG.ssl,
      waitForConnections: true,
      queueLimit: 0
    });
  } else if (dbType === 'postgres') {
    // PostgreSQL 连接
    const { Pool } = require('pg');
    pool = new Pool({
      host: DB_CONFIG.host,
      port: DB_CONFIG.port,
      database: DB_CONFIG.database,
      user: DB_CONFIG.user,
      password: DB_CONFIG.password,
      max: DB_CONFIG.connectionLimit,
      ssl: DB_CONFIG.ssl
    });
  } else {
    throw new Error(`不支持的数据库类型: ${dbType}`);
  }

  return pool;
}

/**
 * 执行标准化查询
 * @param {string} sql SQL 语句
 * @param {Array} params 参数化查询数组
 * @returns {Promise<Array>} 返回结果行数组
 */
async function query(sql, params = []) {
  const dbPool = await getPool();
  const dbType = DB_CONFIG.type;

  try {
    if (dbType === 'mysql') {
      const [rows] = await dbPool.execute(sql, params);
      return rows;
    } else if (dbType === 'postgres') {
      const result = await dbPool.query(sql, params);
      return result.rows;
    }
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * 启动数据库事务
 * @returns {Promise<Object>} 包含 query, commit, rollback 方法的事务对象
 */
async function beginTransaction() {
  const dbPool = await getPool();
  const dbType = DB_CONFIG.type;

  if (dbType === 'mysql') {
    const connection = await dbPool.getConnection();
    await connection.beginTransaction();
    return {
      connection,
      async query(sql, params) {
        const [rows] = await connection.execute(sql, params);
        return rows;
      },
      async commit() {
        await connection.commit();
        connection.release();
      },
      async rollback() {
        await connection.rollback();
        connection.release();
      }
    };
  } else if (dbType === 'postgres') {
    const client = await dbPool.connect();
    await client.query('BEGIN');
    return {
      client,
      async query(sql, params) {
        const result = await client.query(sql, params);
        return result.rows;
      },
      async commit() {
        await client.query('COMMIT');
        client.release();
      },
      async rollback() {
        await client.query('ROLLBACK');
        client.release();
      }
    };
  }
}

/**
 * 数据库健康检查
 * 验证当前配置是否可正常连接并执行基础查询
 * @returns {Promise<boolean>}
 */
async function healthCheck() {
  try {
    const dbPool = await getPool();
    const dbType = DB_CONFIG.type;

    if (dbType === 'mysql') {
      await dbPool.query('SELECT 1');
    } else if (dbType === 'postgres') {
      await dbPool.query('SELECT 1');
    }

    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

/**
 * 关闭数据库连接池
 * 用于应用关闭时的优雅退出
 */
async function closePool() {
  if (pool) {
    const dbType = DB_CONFIG.type;
    
    if (dbType === 'mysql') {
      await pool.end();
    } else if (dbType === 'postgres') {
      await pool.end();
    }
    
    pool = null;
  }
}

module.exports = {
  query,
  beginTransaction,
  healthCheck,
  closePool,
  getPool,
  DB_CONFIG
};
