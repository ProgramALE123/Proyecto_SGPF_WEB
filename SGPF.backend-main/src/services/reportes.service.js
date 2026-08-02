import { ensureUuid, parsePagination } from '../utils/validation.js';
import { obtenerAlineacionPartidoRepository, obtenerRendimientoJugadoresRepository, obtenerResumenPartidosRepository } from '../repositories/reportes.repository.js';

export const obtenerRendimientoJugadoresService = async (query) => obtenerRendimientoJugadoresRepository(parsePagination(query));
export const obtenerResumenPartidosService = async (query) => obtenerResumenPartidosRepository(parsePagination(query));
export const obtenerAlineacionPartidoService = async (partidoId) => obtenerAlineacionPartidoRepository(ensureUuid(partidoId, 'partido_id'));
