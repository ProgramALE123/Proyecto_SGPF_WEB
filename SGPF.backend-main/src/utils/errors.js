import { log } from './logger.js';

export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'APP_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export const badRequest = (message) => new AppError(message, 400, 'BAD_REQUEST');
export const notFound = (message = 'Recurso no encontrado') => new AppError(message, 404, 'NOT_FOUND');
export const conflict = (message = 'Conflicto de concurrencia: versión obsoleta') => new AppError(message, 409, 'CONFLICT');
export const unauthorized = (message = 'No autorizado') => new AppError(message, 401, 'UNAUTHORIZED');
export const forbidden = (message = 'No tienes permisos para realizar esta accion') => new AppError(message, 403, 'FORBIDDEN');

export const mapPostgresError = (error) => {
  if (error instanceof AppError) return error;
  if (error?.type === 'entity.parse.failed') return badRequest('JSON inválido');
  if (error?.type === 'entity.too.large') return new AppError('El cuerpo JSON excede el tamaño permitido', 413, 'PAYLOAD_TOO_LARGE');
  if (error?.code === '23505') return conflict('Ya existe un registro con valores únicos repetidos');
  if (error?.code === '23503') return conflict('La operación está bloqueada por relaciones existentes o inexistentes');
  if (error?.code === '23514') return badRequest('Los datos no cumplen las restricciones del modelo');
  if (error?.code === '23502') return badRequest('Falta un campo obligatorio');
  if (error?.code === '22P02') return badRequest('Identificador o dato con formato inválido');
  if (error?.code === 'P0001' && String(error?.detail || '').includes('STATE_CONFLICT')) return conflict(error.message || 'Conflicto de estado del recurso');
  if (error?.code === 'P0001') return badRequest(error.message || 'La operación viola reglas del dominio');
  return new AppError('Error interno del servidor', 500, 'INTERNAL_ERROR');
};

export const errorHandler = (error, req, res, next) => {
  const mapped = mapPostgresError(error);
  log(mapped.statusCode >= 500 ? 'error' : 'info', 'request_error', { requestId: req.id, statusCode: mapped.statusCode, code: mapped.code });
  res.status(mapped.statusCode).json({ mensaje: mapped.message, codigo: mapped.code, requestId: req.id });
};

export const asyncHandler = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
