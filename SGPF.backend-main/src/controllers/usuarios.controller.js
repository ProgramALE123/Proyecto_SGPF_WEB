import { entities } from '../modules/entities.js';
import { createCrudController } from './crud.controller.js';
import service from '../services/usuarios.service.js';

export default createCrudController(entities.usuarios, service);
