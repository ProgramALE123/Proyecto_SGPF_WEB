import { entities } from '../modules/entities.js';
import repository from '../repositories/alineaciones.repository.js';
import { createCrudService } from './crud.service.js';
import { validatePayload } from '../utils/validation.js';
import { badRequest, conflict } from '../utils/errors.js';
import { requireVersion } from '../utils/validation.js';
import { createAlineacionWithDetails, updateAlineacionWithDetails } from '../repositories/crud.repository.js';

export const createAlineacionesService = (alineacionesRepository) => {
  const base = createCrudService(entities.alineaciones, alineacionesRepository);
  return {
    ...base,
    async create(body) {
      const payload = validatePayload(entities.alineaciones.schema, body);
      if (body.detalles !== undefined) {
        if (!Array.isArray(body.detalles)) throw badRequest('detalles debe ser un arreglo');
        payload.detalles = body.detalles.map((detail) =>
          validatePayload(entities.detalle_alineacion.schema, detail, { partial: true })
        );
      }
      return createAlineacionWithDetails(entities.alineaciones, payload);
    },
    async update(id, body) {
      const version = requireVersion(body);
      const payload = validatePayload(entities.alineaciones.schema, body, { partial: true });
      if (body.detalles !== undefined) {
        if (!Array.isArray(body.detalles)) throw badRequest('detalles debe ser un arreglo');
        payload.detalles = body.detalles.map(detail => validatePayload(entities.detalle_alineacion.schema, detail, { partial: true }));
      }
      if (!Object.keys(payload).length) throw badRequest('Debe enviar al menos un campo mutable');
      const row = await updateAlineacionWithDetails(entities.alineaciones, id, payload, version);
      if (!row) throw conflict('Conflicto de concurrencia: version obsoleta o recurso inexistente');
      return row;
    }
  };
};

export default createAlineacionesService(repository);
