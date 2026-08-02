import { entities } from '../modules/entities.js';
import { createCrudController } from './crud.controller.js';
import service from '../services/jugadores.service.js';

export default createCrudController(entities.jugadores, service);
