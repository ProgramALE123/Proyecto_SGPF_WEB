CREATE OR REPLACE FUNCTION trg_increment_version()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.version := OLD.version + 1;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION trg_validate_detalle_alineacion()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  starters_count integer;
  captains_count integer;
  locked_parent record;
BEGIN
  IF TG_OP = 'INSERT' THEN
    FOR locked_parent IN SELECT id, confirmado FROM alineaciones WHERE id = NEW.alineacion_id FOR UPDATE LOOP
      IF locked_parent.confirmado = TRUE THEN
        RAISE EXCEPTION 'No se puede modificar el detalle de una alineación confirmada'
          USING ERRCODE = 'P0001', DETAIL = 'STATE_CONFLICT';
      END IF;
    END LOOP;
  ELSIF TG_OP = 'DELETE' THEN
    FOR locked_parent IN SELECT id, confirmado FROM alineaciones WHERE id = OLD.alineacion_id FOR UPDATE LOOP
      IF locked_parent.confirmado = TRUE THEN
        RAISE EXCEPTION 'No se puede modificar el detalle de una alineación confirmada'
          USING ERRCODE = 'P0001', DETAIL = 'STATE_CONFLICT';
      END IF;
    END LOOP;
  ELSE
    FOR locked_parent IN
      SELECT id, confirmado
      FROM alineaciones
      WHERE id IN (OLD.alineacion_id, NEW.alineacion_id)
      ORDER BY id
      FOR UPDATE
    LOOP
      IF locked_parent.confirmado = TRUE THEN
        RAISE EXCEPTION 'No se puede modificar el detalle de una alineación confirmada'
          USING ERRCODE = 'P0001', DETAIL = 'STATE_CONFLICT';
      END IF;
    END LOOP;
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.alineacion_id <> NEW.alineacion_id THEN
    SELECT COUNT(*) INTO starters_count
    FROM detalle_alineacion
    WHERE alineacion_id = OLD.alineacion_id
      AND titular = TRUE
      AND id <> OLD.id;

    SELECT COUNT(*) INTO captains_count
    FROM detalle_alineacion
    WHERE alineacion_id = OLD.alineacion_id
      AND capitan = TRUE
      AND id <> OLD.id;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;

  IF NEW.capitan = TRUE AND NEW.titular = FALSE THEN
    RAISE EXCEPTION 'El capitán debe ser titular' USING ERRCODE = 'P0001';
  END IF;

  IF NEW.titular = TRUE AND NEW.minuto_ingreso <> 0 THEN
    RAISE EXCEPTION 'Un jugador titular debe ingresar en el minuto 0' USING ERRCODE = 'P0001';
  END IF;

  SELECT COUNT(*) INTO starters_count
  FROM detalle_alineacion
  WHERE alineacion_id = NEW.alineacion_id
    AND titular = TRUE
    AND id <> COALESCE(NEW.id, gen_random_uuid());

  IF NEW.titular = TRUE AND starters_count >= 11 THEN
    RAISE EXCEPTION 'Una alineación no puede tener más de 11 titulares' USING ERRCODE = 'P0001';
  END IF;

  SELECT COUNT(*) INTO captains_count
  FROM detalle_alineacion
  WHERE alineacion_id = NEW.alineacion_id
    AND capitan = TRUE
    AND id <> COALESCE(NEW.id, gen_random_uuid());

  IF NEW.capitan = TRUE AND captains_count >= 1 THEN
    RAISE EXCEPTION 'Una alineación no puede tener más de un capitán' USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION trg_validate_alineacion_confirmacion()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  starters_count integer;
  captains_count integer;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.confirmado = TRUE THEN
      RAISE EXCEPTION 'Una alineación no puede insertarse confirmada directamente'
        USING ERRCODE = 'P0001';
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'DELETE' THEN
    IF OLD.confirmado = TRUE THEN
      RAISE EXCEPTION 'No se puede eliminar una alineación confirmada'
        USING ERRCODE = 'P0001', DETAIL = 'STATE_CONFLICT';
    END IF;
    RETURN OLD;
  END IF;

  IF OLD.confirmado = TRUE THEN
    RAISE EXCEPTION 'No se puede modificar una alineación confirmada'
      USING ERRCODE = 'P0001', DETAIL = 'STATE_CONFLICT';
  END IF;

  IF NEW.confirmado = TRUE AND OLD.confirmado = FALSE THEN
    SELECT COUNT(*) INTO starters_count
    FROM detalle_alineacion
    WHERE alineacion_id = NEW.id AND titular = TRUE;

    SELECT COUNT(*) INTO captains_count
    FROM detalle_alineacion
    WHERE alineacion_id = NEW.id AND capitan = TRUE AND titular = TRUE;

    IF starters_count <> 11 THEN
      RAISE EXCEPTION 'Una alineación confirmada debe tener exactamente 11 titulares' USING ERRCODE = 'P0001';
    END IF;

    IF captains_count <> 1 THEN
      RAISE EXCEPTION 'Una alineación confirmada debe tener exactamente un capitán titular' USING ERRCODE = 'P0001';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['roles','jugadores','rivales','partidos','usuarios','entrenadores','alineaciones','detalle_alineacion','estadisticas_partido'] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I', 'set_version_' || t, t);
    EXECUTE format('CREATE TRIGGER %I BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION trg_increment_version()', 'set_version_' || t, t);
  END LOOP;
END $$;

DROP TRIGGER IF EXISTS validate_detalle_alineacion ON detalle_alineacion;
CREATE TRIGGER validate_detalle_alineacion
BEFORE INSERT OR UPDATE OR DELETE ON detalle_alineacion
FOR EACH ROW EXECUTE FUNCTION trg_validate_detalle_alineacion();

DROP TRIGGER IF EXISTS validate_alineacion_estado ON alineaciones;
DROP TRIGGER IF EXISTS validate_alineacion_confirmacion ON alineaciones;
CREATE TRIGGER validate_alineacion_estado
BEFORE INSERT OR UPDATE OR DELETE ON alineaciones
FOR EACH ROW EXECUTE FUNCTION trg_validate_alineacion_confirmacion();
