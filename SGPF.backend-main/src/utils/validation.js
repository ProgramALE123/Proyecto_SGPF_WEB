import { badRequest } from './errors.js';

export const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const isUuid = (value) => typeof value === 'string' && uuidRegex.test(value);

export const ensureUuid = (value, field = 'id') => {
  if (!isUuid(value)) throw badRequest(`${field} debe ser un UUID válido`);
  return value;
};

export const parseBoolean = (value) => {
  if (value === undefined) return undefined;
  if (value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;
  throw badRequest('El filtro booleano debe ser true o false');
};

export const parsePagination = (query = {}) => {
  const rawLimit = query.limit === undefined ? 20 : Number(query.limit);
  const rawOffset = query.offset === undefined ? 0 : Number(query.offset);
  if (!Number.isInteger(rawLimit) || rawLimit < 1) throw badRequest('limit debe ser un entero positivo');
  if (!Number.isInteger(rawOffset) || rawOffset < 0) throw badRequest('offset debe ser un entero mayor o igual a 0');
  if (rawOffset > 10000) throw badRequest('offset no puede exceder 10000; use filtros más específicos para paginar');
  return { limit: Math.min(rawLimit, 100), offset: rawOffset };
};

export const requireVersion = (body = {}) => {
  const version = Number(body.version);
  if (!Number.isInteger(version) || version < 1) throw badRequest('version es obligatoria y debe ser un entero positivo');
  return version;
};

const validators = {
  string(value, field, rule) {
    if (value === null && rule.nullable) return null;
    if (value === null) throw badRequest(`${field} no puede ser null`);
    if (value === undefined || value === null || String(value).trim() === '') {
      if (rule.required) throw badRequest(`${field} es obligatorio`);
      return undefined;
    }
    const text = String(value).trim();
    if (rule.max && text.length > rule.max) throw badRequest(`${field} no puede exceder ${rule.max} caracteres`);
    if (rule.min && text.length < rule.min) throw badRequest(`${field} debe tener al menos ${rule.min} caracteres`);
    if (rule.values && !rule.values.includes(text)) throw badRequest(`${field} tiene un valor no permitido`);
    if (rule.email && !text.includes('@')) throw badRequest(`${field} debe ser un correo válido`);
    return text;
  },
  integer(value, field, rule) {
    if (value === null && rule.nullable) return null;
    if (value === null) throw badRequest(`${field} no puede ser null`);
    if (value === undefined || value === null || value === '') {
      if (rule.required) throw badRequest(`${field} es obligatorio`);
      return undefined;
    }
    const number = Number(value);
    if (!Number.isInteger(number)) throw badRequest(`${field} debe ser entero`);
    if (rule.min !== undefined && number < rule.min) throw badRequest(`${field} debe ser mayor o igual a ${rule.min}`);
    if (rule.max !== undefined && number > rule.max) throw badRequest(`${field} debe ser menor o igual a ${rule.max}`);
    return number;
  },
  boolean(value, field, rule) {
    if (value === null && rule.nullable) return null;
    if (value === null) throw badRequest(`${field} no puede ser null`);
    if (value === undefined || value === null) {
      if (rule.required) throw badRequest(`${field} es obligatorio`);
      return undefined;
    }
    return parseBoolean(value);
  },
  uuid(value, field, rule) {
    if (value === null && rule.nullable) return null;
    if (value === null) throw badRequest(`${field} no puede ser null`);
    if (!value) {
      if (rule.required) throw badRequest(`${field} es obligatorio`);
      return undefined;
    }
    return ensureUuid(value, field);
  },
  date(value, field, rule) {
    if (value === null && rule.nullable) return null;
    if (value === null) throw badRequest(`${field} no puede ser null`);
    if (!value) {
      if (rule.required) throw badRequest(`${field} es obligatorio`);
      return undefined;
    }
    const text = String(value);
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
    if (!match) throw badRequest(`${field} debe ser una fecha válida`);
    const date = new Date(`${text}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== text) throw badRequest(`${field} debe ser una fecha válida`);
    return value;
  }
};

export const validatePayload = (schema, body = {}, { partial = false } = {}) => {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) throw badRequest('El cuerpo JSON debe ser un objeto');
  const output = {};
  for (const [field, rule] of Object.entries(schema)) {
    const effectiveRule = partial ? { ...rule, required: false } : rule;
    const hasField = Object.hasOwn(body, field);
    const value = validators[rule.type](hasField ? body[field] : undefined, field, effectiveRule);
    if (hasField && value !== undefined) output[field] = value;
  }
  return output;
};
