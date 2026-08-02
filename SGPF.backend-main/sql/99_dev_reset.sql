-- Development-only rollback/reset helper. Do not run on shared or production databases.
DROP VIEW IF EXISTS vw_alineaciones_detalle;
DROP VIEW IF EXISTS vw_partidos_resumen;
DROP VIEW IF EXISTS vw_jugadores_rendimiento;
DROP FUNCTION IF EXISTS fn_jugadores_disponibles_alineacion(uuid);
DROP FUNCTION IF EXISTS fn_partido_marcador(uuid);
DROP FUNCTION IF EXISTS fn_resumen_jugador(uuid);
DROP FUNCTION IF EXISTS trg_validate_alineacion_confirmacion();
DROP FUNCTION IF EXISTS trg_validate_detalle_alineacion();
DROP FUNCTION IF EXISTS trg_increment_version();
DROP TABLE IF EXISTS detalle_alineacion, estadisticas_partido, alineaciones, entrenadores, usuarios, partidos, rivales, jugadores, roles CASCADE;
