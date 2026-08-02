CREATE OR REPLACE FUNCTION fn_resumen_jugador(p_jugador_id uuid)
RETURNS TABLE (
  jugador_id uuid,
  jugador text,
  posicion varchar,
  partidos integer,
  minutos integer,
  goles integer,
  asistencias integer,
  calificacion_promedio numeric
) LANGUAGE sql STABLE AS $$
  SELECT
    j.jugador_id,
    j.nombres || ' ' || j.apellidos,
    j.posicion,
    j.partidos_registrados,
    j.minutos_jugados,
    j.goles,
    j.asistencias,
    j.calificacion_promedio
  FROM vw_jugadores_rendimiento j
  WHERE j.jugador_id = p_jugador_id;
$$;

CREATE OR REPLACE FUNCTION fn_partido_marcador(p_partido_id uuid)
RETURNS text LANGUAGE sql STABLE AS $$
  SELECT 'Orense ' || goles_orense || ' - ' || goles_rival || ' ' || rival
  FROM vw_partidos_resumen
  WHERE partido_id = p_partido_id;
$$;

CREATE OR REPLACE FUNCTION fn_jugadores_disponibles_alineacion(p_alineacion_id uuid)
RETURNS TABLE (id uuid, nombres varchar, apellidos varchar, posicion varchar, dorsal integer)
LANGUAGE sql STABLE AS $$
  SELECT j.id, j.nombres, j.apellidos, j.posicion, j.dorsal
  FROM jugadores j
  WHERE j.activo = TRUE
    AND NOT EXISTS (
      SELECT 1 FROM detalle_alineacion da
      WHERE da.alineacion_id = p_alineacion_id AND da.jugador_id = j.id
    )
  ORDER BY j.dorsal;
$$;
