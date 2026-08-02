INSERT INTO roles (nombre, descripcion, activo)
VALUES
  ('secretario_tecnico', 'Development administrator role', TRUE),
  ('director_tecnico', 'Director técnico role', TRUE),
  ('presidente_club', 'Presidente del club role', TRUE)
ON CONFLICT (nombre) DO UPDATE
SET descripcion = EXCLUDED.descripcion,
    activo = TRUE
WHERE roles.descripcion IS DISTINCT FROM EXCLUDED.descripcion
   OR roles.activo IS DISTINCT FROM TRUE;
