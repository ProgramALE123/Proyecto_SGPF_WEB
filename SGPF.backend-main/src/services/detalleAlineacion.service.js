import { entities } from '../modules/entities.js';
import repository from '../repositories/detalleAlineacion.repository.js';
import { createCrudService } from './crud.service.js';

export default createCrudService(entities.detalle_alineacion, repository);
