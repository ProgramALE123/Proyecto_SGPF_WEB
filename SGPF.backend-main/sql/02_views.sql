CREATE OR REPLACE VIEW vw_jugadores_rendimiento AS
SELECT
  j.id AS jugador_id,
  j.nombres,
  j.apellidos,
  j.posicion,
  j.dorsal,
  COUNT(ep.id)::integer AS partidos_registrados,
  COALESCE(SUM(ep.minutos_jugados), 0)::integer AS minutos_jugados,
  COALESCE(SUM(ep.goles), 0)::integer AS goles,
  COALESCE(SUM(ep.asistencias), 0)::integer AS asistencias,
  COALESCE(SUM(ep.tarjetas_amarillas), 0)::integer AS tarjetas_amarillas,
  COALESCE(SUM(ep.tarjetas_rojas), 0)::integer AS tarjetas_rojas,
  ROUND(AVG(ep.calificacion)::numeric, 2) AS calificacion_promedio
FROM jugadores j
LEFT JOIN estadisticas_partido ep ON ep.jugador_id = j.id
GROUP BY j.id, j.nombres, j.apellidos, j.posicion, j.dorsal;

CREATE OR REPLACE VIEW vw_partidos_resumen AS
SELECT
  p.id AS partido_id,
  p.fecha_partido,
  r.nombre AS rival,
  p.estadio,
  p.condicion,
  p.goles_orense,
  p.goles_rival,
  p.finalizado,
  CASE
    WHEN NOT p.finalizado THEN 'Pendiente'
    WHEN p.goles_orense > p.goles_rival THEN 'Victoria'
    WHEN p.goles_orense = p.goles_rival THEN 'Empate'
    ELSE 'Derrota'
  END AS resultado
FROM partidos p
JOIN rivales r ON r.id = p.rival_id;

CREATE OR REPLACE VIEW vw_alineaciones_detalle AS
SELECT
  a.id AS alineacion_id,
  a.partido_id,
  a.esquema_tactico,
  a.confirmado,
  e.nombres || ' ' || e.apellidos AS entrenador,
  j.id AS jugador_id,
  j.nombres || ' ' || j.apellidos AS jugador,
  da.posicion_en_campo,
  da.titular,
  da.capitan,
  da.minuto_ingreso,
  da.minuto_salida
FROM alineaciones a
JOIN entrenadores e ON e.id = a.entrenador_id
LEFT JOIN detalle_alineacion da ON da.alineacion_id = a.id
LEFT JOIN jugadores j ON j.id = da.jugador_id;
