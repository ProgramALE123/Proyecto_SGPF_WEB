import { entities } from '../modules/entities.js';
import { createCrudController } from './crud.controller.js';
import service from '../services/roles.service.js';

export default createCrudController(entities.roles, service);
