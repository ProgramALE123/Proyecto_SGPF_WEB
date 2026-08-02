ALTER TABLE detalle_alineacion ADD COLUMN IF NOT EXISTS slot_indice integer;
ALTER TABLE detalle_alineacion DROP CONSTRAINT IF EXISTS chk_detalle_alineacion_slot;
ALTER TABLE detalle_alineacion ADD CONSTRAINT chk_detalle_alineacion_slot CHECK (slot_indice IS NULL OR slot_indice BETWEEN 0 AND 10);
CREATE UNIQUE INDEX IF NOT EXISTS uq_detalle_alineacion_slot ON detalle_alineacion(alineacion_id, slot_indice) WHERE slot_indice IS NOT NULL;
