import { pool } from '../database/connection.js';

export const obtenerRendimientoJugadoresRepository = async ({ limit, offset }) => {
  const result = await pool.query(
    `SELECT *, COUNT(*) OVER()::integer AS __total FROM vw_jugadores_rendimiento
     ORDER BY goles DESC, asistencias DESC, minutos_jugados DESC, jugador_id ASC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  if (result.rows.length) return { data: result.rows.map(({ __total, ...row }) => row), total: result.rows[0].__total };
  const count = await pool.query('SELECT COUNT(*)::integer AS total FROM vw_jugadores_rendimiento');
  return { data: [], total: count.rows[0].total };
};

export const obtenerResumenPartidosRepository = async ({ limit, offset }) => {
  const result = await pool.query(
    `SELECT *, COUNT(*) OVER()::integer AS __total FROM vw_partidos_resumen
     ORDER BY fecha_partido DESC, partido_id ASC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  if (result.rows.length) return { data: result.rows.map(({ __total, ...row }) => row), total: result.rows[0].__total };
  const count = await pool.query('SELECT COUNT(*)::integer AS total FROM vw_partidos_resumen');
  return { data: [], total: count.rows[0].total };
};

export const obtenerAlineacionPartidoRepository = async (partidoId) => {
  const result = await pool.query(
    `SELECT *, COUNT(*) OVER()::integer AS __total FROM vw_alineaciones_detalle
     WHERE partido_id = $1
     ORDER BY titular DESC, posicion_en_campo ASC, jugador_id ASC`,
    [partidoId]
  );
  if (result.rows.length) return { data: result.rows.map(({ __total, ...row }) => row), total: result.rows[0].__total };
  const count = await pool.query('SELECT COUNT(*)::integer AS total FROM vw_alineaciones_detalle WHERE partido_id = $1', [partidoId]);
  return { data: [], total: count.rows[0].total };
};
