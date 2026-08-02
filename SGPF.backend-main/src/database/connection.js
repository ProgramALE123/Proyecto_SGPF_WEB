import pg from 'pg';
import dotenv from 'dotenv';
import { log } from '../utils/logger.js';

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT || 5432),
  max: Number(process.env.DB_MAX_POOL || 10),
  connectionTimeoutMillis: Number(process.env.DB_CONNECTION_TIMEOUT_MS || 5000),
  idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT_MS || 30000),
  statement_timeout: Number(process.env.DB_STATEMENT_TIMEOUT_MS || 15000),
  query_timeout: Number(process.env.DB_QUERY_TIMEOUT_MS || 15000)
});

pool.on('error', (error) => {
  log('error', 'PostgreSQL pool error', { error: error.message });
});

export const verificarConexion = async () => {
  await pool.query('SELECT NOW()');
  log('info', 'Conectado a PostgreSQL');
};

export const withTransaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
