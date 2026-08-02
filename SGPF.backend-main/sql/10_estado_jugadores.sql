ALTER TABLE jugadores ADD COLUMN IF NOT EXISTS estado_deportivo varchar(20) NOT NULL DEFAULT 'Disponible';
ALTER TABLE jugadores ADD COLUMN IF NOT EXISTS condicion_fisica integer NOT NULL DEFAULT 100;
ALTER TABLE jugadores ADD COLUMN IF NOT EXISTS observaciones_medicas varchar(300);
ALTER TABLE jugadores DROP CONSTRAINT IF EXISTS chk_jugadores_estado;
ALTER TABLE jugadores ADD CONSTRAINT chk_jugadores_estado CHECK (estado_deportivo IN ('Disponible', 'Lesionado', 'Suspendido', 'Recuperacion'));
ALTER TABLE jugadores DROP CONSTRAINT IF EXISTS chk_jugadores_condicion;
ALTER TABLE jugadores ADD CONSTRAINT chk_jugadores_condicion CHECK (condicion_fisica BETWEEN 0 AND 100);

UPDATE jugadores SET estado_deportivo='Recuperacion', condicion_fisica=68, observaciones_medicas='Trabajo diferenciado y control de cargas' WHERE dorsal=14;
UPDATE jugadores SET estado_deportivo='Lesionado', condicion_fisica=35, observaciones_medicas='Molestia muscular; pendiente de alta medica' WHERE dorsal=15;
UPDATE jugadores SET estado_deportivo='Suspendido', condicion_fisica=92, observaciones_medicas='No disponible por suspension' WHERE dorsal=12;

CREATE OR REPLACE FUNCTION fn_validar_jugador_alineacion() RETURNS trigger AS $$
DECLARE jugador jugadores%ROWTYPE;
BEGIN
  SELECT * INTO jugador FROM jugadores WHERE id=NEW.jugador_id;
  IF jugador.estado_deportivo <> 'Disponible' THEN
    RAISE EXCEPTION 'El jugador % no esta disponible: %', jugador.apellidos, jugador.estado_deportivo;
  END IF;
  IF (NEW.posicion_en_campo='Portero' AND jugador.posicion<>'Portero') OR (NEW.posicion_en_campo<>'Portero' AND jugador.posicion='Portero') THEN
    RAISE EXCEPTION 'Posicion incompatible para %: % no puede jugar como %', jugador.apellidos, jugador.posicion, NEW.posicion_en_campo;
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_validar_jugador_alineacion ON detalle_alineacion;
CREATE TRIGGER trg_validar_jugador_alineacion BEFORE INSERT OR UPDATE ON detalle_alineacion FOR EACH ROW EXECUTE FUNCTION fn_validar_jugador_alineacion();
