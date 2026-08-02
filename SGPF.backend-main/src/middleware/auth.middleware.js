import { forbidden, unauthorized } from '../utils/errors.js';
import { verifyAccessToken } from '../services/auth.service.js';
export const requireAuth = (req, res, next) => {
  const [scheme, token] = String(req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) return next(unauthorized('Token de acceso requerido'));
  try { req.user = verifyAccessToken(token); next(); } catch { next(unauthorized('Token inválido o vencido')); }
};
export const requireRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) return next(forbidden());
  next();
};
