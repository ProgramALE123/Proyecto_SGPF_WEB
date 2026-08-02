import { entities } from '../modules/entities.js';
import repository from '../repositories/jugadores.repository.js';
import { createCrudService } from './crud.service.js';

export default createCrudService(entities.jugadores, repository);
