import { badRequest, conflict, notFound } from '../utils/errors.js';
import { ensureUuid, parseBoolean, parsePagination, requireVersion, validatePayload } from '../utils/validation.js';
import { hashPassword } from '../utils/passwords.js';

const normalizeFilters = (definition, query) => {
  const filters = { ...query };
  delete filters.limit;
  delete filters.offset;
  for (const field of Object.keys(filters)) {
    if (field === 'search') continue;
    if (!definition.allowedFilters?.includes(field)) delete filters[field];
  }
  for (const [field, value] of Object.entries(filters)) {
    const type = definition.schema[field]?.type;
    if (type === 'uuid') filters[field] = ensureUuid(value, field);
    if (type === 'boolean') filters[field] = parseBoolean(value);
  }
  return filters;
};

export const createCrudService = (definition, repository) => ({
  async list(query) {
    const { limit, offset } = parsePagination(query);
    const filters = normalizeFilters(definition, query);
    return repository.findAll({ filters, limit, offset });
  },

  async get(id) {
    const row = await repository.findById(id);
    if (!row) throw notFound(`${definition.label} no encontrado`);
    return row;
  },

  async create(body) {
    if (definition.table === 'usuarios' && Object.hasOwn(body || {}, 'clave_hash')) {
      throw badRequest('Use clave; clave_hash no se acepta desde HTTP');
    }
    const payload = validatePayload(definition.schema, body);
    if (definition.table === 'usuarios') {
      payload.clave_hash = await hashPassword(payload.clave);
      delete payload.clave;
    }
    return repository.create(payload);
  },

  async update(id, body) {
    const version = requireVersion(body);
    if (definition.table === 'usuarios' && Object.hasOwn(body || {}, 'clave_hash')) {
      throw badRequest('Use clave; clave_hash no se acepta desde HTTP');
    }
    const payload = validatePayload(definition.schema, body, { partial: true });
    if (definition.table === 'usuarios' && Object.hasOwn(payload, 'clave')) {
      payload.clave_hash = await hashPassword(payload.clave);
      delete payload.clave;
    }
    if (!Object.keys(payload).length) {
      const currentVersionExists = await repository.existsWithVersion(id, version);
      if (!currentVersionExists) throw conflict('Conflicto de concurrencia: versión obsoleta o recurso inexistente');
      throw badRequest('Debe enviar al menos un campo mutable');
    }
    const row = await repository.update(id, payload, version);
    if (!row) throw conflict('Conflicto de concurrencia: versión obsoleta o recurso inexistente');
    return row;
  },

  async remove(id, body) {
    const version = requireVersion(body);
    const row = await repository.remove(id, version);
    if (!row) throw conflict('Conflicto de concurrencia: versión obsoleta o recurso inexistente');
    return row;
  }
});
