import { entities } from '../modules/entities.js';
import { createCrudController } from './crud.controller.js';
import service from '../services/estadisticasPartido.service.js';

export default createCrudController(entities.estadisticas_partido, service);
