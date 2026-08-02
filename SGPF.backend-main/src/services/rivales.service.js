import { entities } from '../modules/entities.js';
import repository from '../repositories/rivales.repository.js';
import { createCrudService } from './crud.service.js';

export default createCrudService(entities.rivales, repository);
