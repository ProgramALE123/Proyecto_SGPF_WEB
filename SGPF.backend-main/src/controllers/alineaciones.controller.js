import { entities } from '../modules/entities.js';
import { createCrudController } from './crud.controller.js';
import service from '../services/alineaciones.service.js';

export default createCrudController(entities.alineaciones, service);
