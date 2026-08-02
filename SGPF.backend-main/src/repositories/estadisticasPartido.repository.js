import { entities } from '../modules/entities.js';
import { createCrudRepository } from './crud.repository.js';

export default createCrudRepository(entities.estadisticas_partido);
