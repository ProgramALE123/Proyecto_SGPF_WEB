INSERT INTO rivales (nombre, ciudad, pais, activo)
VALUES
  ('Macara', 'Ambato', 'Ecuador', TRUE),
  ('El Nacional', 'Quito', 'Ecuador', TRUE),
  ('Mushuc Runa', 'Ambato', 'Ecuador', TRUE),
  ('Libertad FC', 'Loja', 'Ecuador', TRUE),
  ('Universidad Catolica', 'Quito', 'Ecuador', TRUE),
  ('Tecnico Universitario', 'Ambato', 'Ecuador', TRUE),
  ('Delfin SC', 'Manta', 'Ecuador', TRUE),
  ('Manta FC', 'Manta', 'Ecuador', TRUE)
ON CONFLICT (nombre) DO UPDATE SET ciudad=EXCLUDED.ciudad, pais=EXCLUDED.pais, activo=TRUE;

INSERT INTO partidos (rival_id, fecha_partido, estadio, condicion, goles_orense, goles_rival, finalizado, observaciones)
SELECT r.id, p.fecha::date, p.estadio, p.condicion, 0, 0, FALSE, 'Partido programado - Liga Pro Serie A'
FROM (VALUES
  ('Macara', '2026-08-24', 'Estadio Bellavista', 'Visitante'),
  ('El Nacional', '2026-08-31', 'Estadio 9 de Mayo', 'Local'),
  ('Mushuc Runa', '2026-09-07', 'Estadio Cooperativa de Ahorro y Credito Mushuc Runa', 'Visitante'),
  ('Libertad FC', '2026-09-14', 'Estadio 9 de Mayo', 'Local'),
  ('Universidad Catolica', '2026-09-21', 'Estadio Olimpico Atahualpa', 'Visitante'),
  ('Tecnico Universitario', '2026-09-28', 'Estadio 9 de Mayo', 'Local'),
  ('Delfin SC', '2026-10-05', 'Estadio Jocay', 'Visitante'),
  ('Manta FC', '2026-10-12', 'Estadio 9 de Mayo', 'Local')
) AS p(rival, fecha, estadio, condicion)
JOIN rivales r ON r.nombre=p.rival
WHERE NOT EXISTS (
  SELECT 1 FROM partidos existente
  WHERE existente.rival_id=r.id AND existente.fecha_partido=p.fecha::date
);
