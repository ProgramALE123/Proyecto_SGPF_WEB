import { entities } from '../modules/entities.js';
import { createCrudController } from './crud.controller.js';
import service from '../services/detalleAlineacion.service.js';

export default createCrudController(entities.detalle_alineacion, service);
