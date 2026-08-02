EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM jugadores WHERE activo = TRUE AND posicion = 'Delantero' ORDER BY apellidos LIMIT 20;

EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM jugadores WHERE nombres ILIKE '%juan%' OR apellidos ILIKE '%juan%' OR cedula ILIKE '%juan%' ORDER BY apellidos, nombres, id LIMIT 20;

EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM rivales WHERE nombre ILIKE '%liga%' OR ciudad ILIKE '%liga%' OR pais ILIKE '%liga%' ORDER BY nombre, id LIMIT 20;

EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM vw_partidos_resumen WHERE fecha_partido >= CURRENT_DATE - INTERVAL '90 days' ORDER BY fecha_partido DESC LIMIT 20;

EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM vw_jugadores_rendimiento ORDER BY goles DESC, asistencias DESC LIMIT 20;
