BEGIN;

-- Normaliza la restricción si una instalación previa desde Windows dañó las tildes.
ALTER TABLE entrenadores DROP CONSTRAINT IF EXISTS chk_entrenadores_cargo;
ALTER TABLE entrenadores ADD CONSTRAINT chk_entrenadores_cargo
  CHECK (cargo IN ('Director Técnico', 'Asistente Técnico', 'Preparador Físico', 'Entrenador de Arqueros'));

INSERT INTO jugadores (nombres, apellidos, cedula, fecha_nacimiento, posicion, dorsal, nacionalidad, activo)
VALUES
  ('David', 'Cabezas', '0701000001', '1991-06-12', 'Portero', 1, 'Ecuatoriana', TRUE),
  ('Pedro', 'Velasco', '0701000002', '1993-06-29', 'Defensa', 2, 'Ecuatoriana', TRUE),
  ('Gabriel', 'Achilier', '0701000003', '1985-03-24', 'Defensa', 3, 'Ecuatoriana', TRUE),
  ('Richard', 'Calderón', '0701000004', '1993-06-25', 'Defensa', 4, 'Ecuatoriana', TRUE),
  ('Óscar', 'Quiñónez', '0701000005', '2001-04-19', 'Defensa', 5, 'Ecuatoriana', TRUE),
  ('Robert', 'Burbano', '0701000006', '1995-04-10', 'Mediocampista', 6, 'Ecuatoriana', TRUE),
  ('José', 'Cifuentes', '0701000007', '1999-03-12', 'Mediocampista', 7, 'Ecuatoriana', TRUE),
  ('Fernando', 'Gaibor', '0701000008', '1991-10-08', 'Mediocampista', 8, 'Ecuatoriana', TRUE),
  ('Miguel', 'Parrales', '0701000009', '1995-12-26', 'Delantero', 9, 'Ecuatoriana', TRUE),
  ('Fidel', 'Martínez', '0701000010', '1990-02-15', 'Delantero', 10, 'Ecuatoriana', TRUE),
  ('Sergio', 'Vásquez', '0701000011', '2000-08-17', 'Delantero', 11, 'Ecuatoriana', TRUE),
  ('Bryan', 'Carabalí', '0701000012', '1997-12-18', 'Defensa', 12, 'Ecuatoriana', TRUE),
  ('Luis', 'Cano', '0701000013', '1999-09-05', 'Mediocampista', 13, 'Ecuatoriana', TRUE),
  ('Rolando', 'Silva', '0701000014', '1995-05-11', 'Portero', 14, 'Ecuatoriana', TRUE),
  ('Daniel', 'Coronel', '0701000015', '1998-02-03', 'Defensa', 15, 'Ecuatoriana', TRUE)
ON CONFLICT (cedula) DO UPDATE SET
  nombres = EXCLUDED.nombres, apellidos = EXCLUDED.apellidos,
  fecha_nacimiento = EXCLUDED.fecha_nacimiento, posicion = EXCLUDED.posicion,
  nacionalidad = EXCLUDED.nacionalidad, activo = TRUE;

INSERT INTO entrenadores (nombres, apellidos, cedula, telefono, correo, cargo, fecha_ingreso, activo)
VALUES
  ('Juan Carlos', 'León', '0702000001', '0991000001', 'juan.leon@sgpf.local', 'Director Técnico', '2025-01-06', TRUE),
  ('Marco', 'Pazmiño', '0702000002', '0991000002', 'marco.pazmino@sgpf.local', 'Asistente Técnico', '2025-01-06', TRUE),
  ('Andrés', 'Mendoza', '0702000003', '0991000003', 'andres.mendoza@sgpf.local', 'Preparador Físico', '2025-01-10', TRUE),
  ('Carlos', 'Espinoza', '0702000004', '0991000004', 'carlos.espinoza@sgpf.local', 'Entrenador de Arqueros', '2025-01-10', TRUE)
ON CONFLICT (cedula) DO UPDATE SET
  telefono = EXCLUDED.telefono, correo = EXCLUDED.correo,
  cargo = EXCLUDED.cargo, activo = TRUE;

INSERT INTO rivales (nombre, ciudad, pais, activo)
VALUES
  ('Barcelona SC', 'Guayaquil', 'Ecuador', TRUE),
  ('Emelec', 'Guayaquil', 'Ecuador', TRUE),
  ('Liga de Quito', 'Quito', 'Ecuador', TRUE),
  ('Independiente del Valle', 'Sangolquí', 'Ecuador', TRUE),
  ('Deportivo Cuenca', 'Cuenca', 'Ecuador', TRUE),
  ('Aucas', 'Quito', 'Ecuador', TRUE)
ON CONFLICT (nombre) DO UPDATE SET ciudad = EXCLUDED.ciudad, pais = EXCLUDED.pais, activo = TRUE;

INSERT INTO partidos (rival_id, fecha_partido, estadio, condicion, goles_orense, goles_rival, finalizado, observaciones)
SELECT r.id, v.fecha, v.estadio, v.condicion, v.gf, v.gc, v.finalizado, v.observaciones
FROM (VALUES
  ('Barcelona SC', DATE '2026-02-15', 'Estadio 9 de Mayo', 'Local', 2, 1, TRUE, 'Primera fecha de Liga Pro'),
  ('Emelec', DATE '2026-02-22', 'Estadio George Capwell', 'Visitante', 1, 1, TRUE, 'Empate como visitante'),
  ('Deportivo Cuenca', DATE '2026-03-01', 'Estadio 9 de Mayo', 'Local', 3, 0, TRUE, 'Victoria en casa'),
  ('Aucas', DATE '2026-03-08', 'Estadio Gonzalo Pozo Ripalda', 'Visitante', 0, 2, TRUE, 'Partido de Liga Pro'),
  ('Liga de Quito', DATE '2026-08-10', 'Estadio 9 de Mayo', 'Local', 0, 0, FALSE, 'Próximo partido'),
  ('Independiente del Valle', DATE '2026-08-17', 'Estadio Banco Guayaquil', 'Visitante', 0, 0, FALSE, 'Partido programado')
) AS v(rival, fecha, estadio, condicion, gf, gc, finalizado, observaciones)
JOIN rivales r ON r.nombre = v.rival
WHERE NOT EXISTS (
  SELECT 1 FROM partidos p WHERE p.rival_id = r.id AND p.fecha_partido = v.fecha
);

INSERT INTO estadisticas_partido (partido_id, jugador_id, minutos_jugados, goles, asistencias, tarjetas_amarillas, tarjetas_rojas, calificacion)
SELECT p.id, j.id,
       CASE WHEN j.dorsal <= 11 THEN 90 ELSE 0 END,
       CASE WHEN j.dorsal = 9 THEN 1 WHEN j.dorsal = 10 THEN 1 ELSE 0 END,
       CASE WHEN j.dorsal IN (7, 8) THEN 1 ELSE 0 END,
       CASE WHEN j.dorsal IN (4, 6) THEN 1 ELSE 0 END,
       0,
       CASE WHEN j.dorsal IN (9, 10) THEN 9 WHEN j.dorsal <= 11 THEN 8 ELSE 6 END
FROM partidos p
JOIN rivales r ON r.id = p.rival_id AND r.nombre = 'Barcelona SC'
CROSS JOIN jugadores j
WHERE p.fecha_partido = DATE '2026-02-15' AND j.dorsal <= 11
ON CONFLICT (partido_id, jugador_id) DO UPDATE SET
  minutos_jugados = EXCLUDED.minutos_jugados, goles = EXCLUDED.goles,
  asistencias = EXCLUDED.asistencias, tarjetas_amarillas = EXCLUDED.tarjetas_amarillas,
  tarjetas_rojas = EXCLUDED.tarjetas_rojas, calificacion = EXCLUDED.calificacion;

INSERT INTO alineaciones (partido_id, entrenador_id, esquema_tactico, observaciones, confirmado)
SELECT p.id, e.id, '4-4-2', 'Alineación inicial de demostración', FALSE
FROM partidos p
JOIN rivales r ON r.id = p.rival_id AND r.nombre = 'Liga de Quito'
CROSS JOIN LATERAL (SELECT id FROM entrenadores WHERE cargo = 'Director Técnico' ORDER BY creado_en LIMIT 1) e
WHERE p.fecha_partido = DATE '2026-08-10'
ON CONFLICT (partido_id) DO NOTHING;

INSERT INTO detalle_alineacion (alineacion_id, jugador_id, posicion_en_campo, titular, capitan, minuto_ingreso)
SELECT a.id, j.id, j.posicion, TRUE, j.dorsal = 10, 0
FROM alineaciones a
JOIN partidos p ON p.id = a.partido_id AND p.fecha_partido = DATE '2026-08-10'
JOIN jugadores j ON j.dorsal <= 11
ON CONFLICT (alineacion_id, jugador_id) DO NOTHING;

COMMIT;
