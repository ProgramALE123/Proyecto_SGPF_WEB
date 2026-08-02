import { entities } from '../modules/entities.js';
import repository from '../repositories/entrenadores.repository.js';
import { createCrudService } from './crud.service.js';

export default createCrudService(entities.entrenadores, repository);
