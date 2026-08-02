import { entities } from '../modules/entities.js';
import { createCrudController } from './crud.controller.js';
import service from '../services/rivales.service.js';

export default createCrudController(entities.rivales, service);
