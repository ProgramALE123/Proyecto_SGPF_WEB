ALTER TABLE alineaciones DROP CONSTRAINT IF EXISTS chk_alineaciones_esquema;
ALTER TABLE alineaciones ADD CONSTRAINT chk_alineaciones_esquema
  CHECK (esquema_tactico IN ('4-4-2', '4-3-3', '3-5-2', '4-2-3-1', '5-3-2', '3-4-3'));
