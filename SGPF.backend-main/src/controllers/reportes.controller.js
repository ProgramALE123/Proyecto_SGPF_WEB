import { asyncHandler } from '../utils/errors.js';
import { obtenerAlineacionPartidoService, obtenerRendimientoJugadoresService, obtenerResumenPartidosService } from '../services/reportes.service.js';

export const rendimientoJugadores = asyncHandler(async (req, res) => {
  const result = await obtenerRendimientoJugadoresService(req.query);
  res.json({ mensaje: 'Rendimiento de jugadores', total: result.total, jugadores: result.data });
});

export const resumenPartidos = asyncHandler(async (req, res) => {
  const result = await obtenerResumenPartidosService(req.query);
  res.json({ mensaje: 'Resumen de partidos', total: result.total, partidos: result.data });
});

export const alineacionPartido = asyncHandler(async (req, res) => {
  const result = await obtenerAlineacionPartidoService(req.params.partido_id);
  res.json({ mensaje: 'Alineación del partido', total: result.total, alineacion: result.data });
});
