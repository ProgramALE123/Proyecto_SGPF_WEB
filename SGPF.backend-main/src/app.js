import express from 'express';
import dotenv from 'dotenv';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import rolesRoutes from './routes/roles.routes.js';
import usuariosRoutes from './routes/usuarios.routes.js';
import jugadoresRoutes from './routes/jugadores.routes.js';
import entrenadoresRoutes from './routes/entrenadores.routes.js';
import rivalesRoutes from './routes/rivales.routes.js';
import partidosRoutes from './routes/partidos.routes.js';
import alineacionesRoutes from './routes/alineaciones.routes.js';
import detalleAlineacionRoutes from './routes/detalleAlineacion.routes.js';
import estadisticasPartidoRoutes from './routes/estadisticasPartido.routes.js';
import reportesRoutes from './routes/reportes.routes.js';
import authRoutes from './routes/auth.routes.js';
import { requireAuth, requireRoles } from './middleware/auth.middleware.js';
import { errorHandler } from './utils/errors.js';
import { pool } from './database/connection.js';
import { log } from './utils/logger.js';

dotenv.config();

const configureCors = (app) => {
  const allowed = (process.env.CORS_ALLOWED_ORIGINS || '').split(',').map((origin) => origin.trim()).filter(Boolean);
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && allowed.includes(origin)) res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-Id');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  });
};

export const createApp = ({ authRequired = false } = {}) => {
  const app = express();
  app.disable('etag');
  app.use((req, res, next) => {
    req.id = req.headers['x-request-id'] || randomUUID();
    res.setHeader('X-Request-Id', req.id);
    const start = Date.now();
    res.on('finish', () => log('info', 'http_request', { requestId: req.id, method: req.method, path: req.path, statusCode: res.statusCode, durationMs: Date.now() - start }));
    next();
  });
  app.use(express.json({ strict: true, limit: '256kb' }));
  configureCors(app);
  app.use('/api', (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  });

  app.get('/', (req, res) => {
    res.json({ mensaje: 'API REST SGPF con Express y PostgreSQL funcionando', arquitectura: 'routes, controllers, services, repositories, database' });
  });

  app.get('/health', (req, res) => res.json({ status: 'ok' }));
  app.get('/ready', async (req, res, next) => {
    try {
      await pool.query('SELECT 1');
      res.json({ status: 'ready' });
    } catch (error) {
      next(error);
    }
  });

  app.use('/api/auth', authRoutes);
  if (authRequired) app.use('/api', requireAuth);

  const roles = (...allowed) => authRequired ? requireRoles(...allowed) : (_req, _res, next) => next();
  const presidente = roles('presidente_club');
  const direccion = roles('presidente_club', 'director_tecnico');
  const equipo = roles('presidente_club', 'director_tecnico', 'secretario_tecnico');

  app.use('/api/roles', presidente, rolesRoutes);
  app.use('/api/usuarios', presidente, usuariosRoutes);
  app.use('/api/jugadores', equipo, jugadoresRoutes);
  app.use('/api/entrenadores', direccion, entrenadoresRoutes);
  app.use('/api/rivales', equipo, rivalesRoutes);
  app.use('/api/partidos', equipo, partidosRoutes);
  app.use('/api/alineaciones', direccion, alineacionesRoutes);
  app.use('/api/detalle-alineacion', direccion, detalleAlineacionRoutes);
  app.use('/api/estadisticas-partido', direccion, estadisticasPartidoRoutes);
  app.use('/api/reportes', equipo, reportesRoutes);

  if (process.env.NODE_ENV === 'production') {
    const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
    const frontendDirectory = path.resolve(currentDirectory, '../../SGPF_FRONTEND/dist/sgpf-orense-sc/browser');
    app.use(express.static(frontendDirectory, { maxAge: '1d', index: false }));
    app.use((req, res, next) => {
      if (req.method === 'GET' && req.accepts('html')) {
        return res.sendFile(path.join(frontendDirectory, 'index.html'));
      }
      next();
    });
  }

  app.use(errorHandler);
  return app;
};

export default createApp({ authRequired: true });
