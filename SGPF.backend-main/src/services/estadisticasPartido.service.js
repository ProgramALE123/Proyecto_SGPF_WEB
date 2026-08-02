import { entities } from '../modules/entities.js';
import repository from '../repositories/estadisticasPartido.repository.js';
import { createCrudService } from './crud.service.js';

export default createCrudService(entities.estadisticas_partido, repository);
