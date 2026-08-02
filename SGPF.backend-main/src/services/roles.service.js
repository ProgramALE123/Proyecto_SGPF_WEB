import { entities } from '../modules/entities.js';
import repository from '../repositories/roles.repository.js';
import { createCrudService } from './crud.service.js';

export default createCrudService(entities.roles, repository);
