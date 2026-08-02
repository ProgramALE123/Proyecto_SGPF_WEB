import app from './app.js';
import { pool, verificarConexion } from './database/connection.js';
import { log } from './utils/logger.js';

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || (process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1');

let server;

const shutdown = async (signal) => {
  log('info', 'shutdown_started', { signal });
  if (server) {
    server.close(async () => {
      await pool.end();
      log('info', 'shutdown_completed');
      process.exit(0);
    });
    setTimeout(() => process.exit(1), Number(process.env.SHUTDOWN_TIMEOUT_MS || 10000)).unref();
  }
};

try {
  await verificarConexion();
  server = app.listen(PORT, HOST, () => {
    log('info', 'server_started', { url: `http://${HOST}:${PORT}` });
  });
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
} catch (error) {
  log('error', 'startup_failed', { error: error.message });
  await pool.end();
  process.exit(1);
}
