CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre varchar(50) NOT NULL,
  descripcion varchar(200),
  activo boolean NOT NULL DEFAULT TRUE,
  creado_en timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT uq_roles_nombre UNIQUE (nombre),
  CONSTRAINT chk_roles_nombre CHECK (nombre IN ('secretario_tecnico', 'director_tecnico', 'presidente_club')),
  CONSTRAINT chk_roles_version CHECK (version > 0)
);

CREATE TABLE IF NOT EXISTS jugadores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombres varchar(80) NOT NULL,
  apellidos varchar(80) NOT NULL,
  cedula varchar(20) NOT NULL,
  fecha_nacimiento date NOT NULL,
  posicion varchar(40) NOT NULL,
  dorsal integer NOT NULL,
  nacionalidad varchar(60) NOT NULL DEFAULT 'Ecuatoriana',
  foto_url varchar(500),
  estado_deportivo varchar(20) NOT NULL DEFAULT 'Disponible',
  condicion_fisica integer NOT NULL DEFAULT 100,
  observaciones_medicas varchar(300),
  activo boolean NOT NULL DEFAULT TRUE,
  creado_en timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT uq_jugadores_cedula UNIQUE (cedula),
  CONSTRAINT uq_jugadores_dorsal UNIQUE (dorsal),
  CONSTRAINT chk_jugadores_dorsal CHECK (dorsal BETWEEN 1 AND 99),
  CONSTRAINT chk_jugadores_estado CHECK (estado_deportivo IN ('Disponible', 'Lesionado', 'Suspendido', 'Recuperacion')),
  CONSTRAINT chk_jugadores_condicion CHECK (condicion_fisica BETWEEN 0 AND 100),
  CONSTRAINT chk_jugadores_posicion CHECK (posicion IN ('Portero', 'Defensa', 'Mediocampista', 'Delantero')),
  CONSTRAINT chk_jugadores_version CHECK (version > 0)
);

CREATE TABLE IF NOT EXISTS rivales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre varchar(100) NOT NULL,
  ciudad varchar(80) NOT NULL,
  pais varchar(80) NOT NULL DEFAULT 'Ecuador',
  foto_url varchar(500),
  activo boolean NOT NULL DEFAULT TRUE,
  creado_en timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT uq_rivales_nombre UNIQUE (nombre),
  CONSTRAINT chk_rivales_version CHECK (version > 0)
);

CREATE TABLE IF NOT EXISTS partidos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rival_id uuid NOT NULL REFERENCES rivales(id) ON DELETE RESTRICT,
  fecha_partido date NOT NULL,
  estadio varchar(120) NOT NULL,
  condicion varchar(20) NOT NULL,
  goles_orense integer NOT NULL DEFAULT 0,
  goles_rival integer NOT NULL DEFAULT 0,
  finalizado boolean NOT NULL DEFAULT FALSE,
  observaciones varchar(300),
  creado_en timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT chk_partidos_condicion CHECK (condicion IN ('Local', 'Visitante', 'Neutral')),
  CONSTRAINT chk_partidos_goles_orense CHECK (goles_orense >= 0),
  CONSTRAINT chk_partidos_goles_rival CHECK (goles_rival >= 0),
  CONSTRAINT chk_partidos_version CHECK (version > 0)
);

CREATE TABLE IF NOT EXISTS usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rol_id uuid NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
  nombre_usuario varchar(50) NOT NULL,
  correo varchar(120) NOT NULL,
  clave_hash varchar(255) NOT NULL,
  foto_url varchar(500),
  activo boolean NOT NULL DEFAULT TRUE,
  ultimo_acceso timestamp without time zone,
  creado_en timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT uq_usuarios_nombre_usuario UNIQUE (nombre_usuario),
  CONSTRAINT uq_usuarios_correo UNIQUE (correo),
  CONSTRAINT chk_usuarios_correo CHECK (correo LIKE '%@%'),
  CONSTRAINT chk_usuarios_nombre_usuario CHECK (char_length(nombre_usuario) >= 4),
  CONSTRAINT chk_usuarios_version CHECK (version > 0)
);

CREATE TABLE IF NOT EXISTS entrenadores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid UNIQUE REFERENCES usuarios(id) ON DELETE SET NULL,
  nombres varchar(80) NOT NULL,
  apellidos varchar(80) NOT NULL,
  cedula varchar(20) NOT NULL,
  telefono varchar(30),
  correo varchar(120),
  cargo varchar(60) NOT NULL,
  fecha_ingreso date NOT NULL,
  foto_url varchar(500),
  activo boolean NOT NULL DEFAULT TRUE,
  creado_en timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT uq_entrenadores_cedula UNIQUE (cedula),
  CONSTRAINT chk_entrenadores_cargo CHECK (cargo IN ('Director Técnico', 'Asistente Técnico', 'Preparador Físico', 'Entrenador de Arqueros')),
  CONSTRAINT chk_entrenadores_correo CHECK (correo IS NULL OR correo LIKE '%@%'),
  CONSTRAINT chk_entrenadores_version CHECK (version > 0)
);

CREATE TABLE IF NOT EXISTS alineaciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partido_id uuid NOT NULL UNIQUE REFERENCES partidos(id) ON DELETE CASCADE,
  entrenador_id uuid NOT NULL REFERENCES entrenadores(id) ON DELETE RESTRICT,
  esquema_tactico varchar(20) NOT NULL,
  observaciones varchar(300),
  confirmado boolean NOT NULL DEFAULT FALSE,
  creado_en timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT chk_alineaciones_esquema CHECK (esquema_tactico IN ('4-4-2', '4-3-3', '3-5-2', '4-2-3-1', '5-3-2', '3-4-3')),
  CONSTRAINT chk_alineaciones_version CHECK (version > 0)
);

CREATE TABLE IF NOT EXISTS detalle_alineacion (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alineacion_id uuid NOT NULL REFERENCES alineaciones(id) ON DELETE CASCADE,
  jugador_id uuid NOT NULL REFERENCES jugadores(id) ON DELETE RESTRICT,
  posicion_en_campo varchar(40) NOT NULL,
  slot_indice integer,
  titular boolean NOT NULL DEFAULT TRUE,
  capitan boolean NOT NULL DEFAULT FALSE,
  minuto_ingreso integer NOT NULL DEFAULT 0,
  minuto_salida integer,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT uq_detalle_alineacion_jugador UNIQUE (alineacion_id, jugador_id),
  CONSTRAINT chk_detalle_alineacion_minuto_ingreso CHECK (minuto_ingreso BETWEEN 0 AND 120),
  CONSTRAINT chk_detalle_alineacion_slot CHECK (slot_indice IS NULL OR slot_indice BETWEEN 0 AND 10),
  CONSTRAINT chk_detalle_alineacion_minuto_salida CHECK (minuto_salida IS NULL OR minuto_salida BETWEEN 1 AND 120),
  CONSTRAINT chk_detalle_alineacion_minutos CHECK (minuto_salida IS NULL OR minuto_salida > minuto_ingreso),
  CONSTRAINT chk_detalle_alineacion_version CHECK (version > 0)
);

CREATE TABLE IF NOT EXISTS estadisticas_partido (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partido_id uuid NOT NULL REFERENCES partidos(id) ON DELETE CASCADE,
  jugador_id uuid NOT NULL REFERENCES jugadores(id) ON DELETE RESTRICT,
  minutos_jugados integer NOT NULL DEFAULT 0,
  goles integer NOT NULL DEFAULT 0,
  asistencias integer NOT NULL DEFAULT 0,
  tarjetas_amarillas integer NOT NULL DEFAULT 0,
  tarjetas_rojas integer NOT NULL DEFAULT 0,
  calificacion integer,
  creado_en timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT uq_estadisticas_partido_jugador UNIQUE (partido_id, jugador_id),
  CONSTRAINT chk_estadisticas_minutos CHECK (minutos_jugados BETWEEN 0 AND 120),
  CONSTRAINT chk_estadisticas_goles CHECK (goles >= 0),
  CONSTRAINT chk_estadisticas_asistencias CHECK (asistencias >= 0),
  CONSTRAINT chk_estadisticas_tarjetas_amarillas CHECK (tarjetas_amarillas BETWEEN 0 AND 2),
  CONSTRAINT chk_estadisticas_tarjetas_rojas CHECK (tarjetas_rojas BETWEEN 0 AND 1),
  CONSTRAINT chk_estadisticas_calificacion CHECK (calificacion IS NULL OR calificacion BETWEEN 1 AND 10),
  CONSTRAINT chk_estadisticas_version CHECK (version > 0)
);

CREATE INDEX IF NOT EXISTS idx_jugadores_activo_posicion ON jugadores (activo, posicion);
CREATE INDEX IF NOT EXISTS idx_jugadores_apellidos ON jugadores (apellidos);
DROP INDEX IF EXISTS idx_jugadores_busqueda_trgm;
CREATE INDEX IF NOT EXISTS idx_jugadores_nombres_trgm ON jugadores USING gin (nombres gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_jugadores_apellidos_trgm ON jugadores USING gin (apellidos gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_jugadores_cedula_trgm ON jugadores USING gin (cedula gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_partidos_fecha ON partidos (fecha_partido DESC);
CREATE INDEX IF NOT EXISTS idx_partidos_rival_fecha ON partidos (rival_id, fecha_partido DESC);
CREATE INDEX IF NOT EXISTS idx_partidos_finalizado ON partidos (finalizado);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios (rol_id);
CREATE INDEX IF NOT EXISTS idx_entrenadores_cargo ON entrenadores (cargo);
DROP INDEX IF EXISTS idx_entrenadores_busqueda_trgm;
DROP INDEX IF EXISTS idx_rivales_busqueda_trgm;
DROP INDEX IF EXISTS idx_usuarios_busqueda_trgm;
CREATE INDEX IF NOT EXISTS idx_entrenadores_nombres_trgm ON entrenadores USING gin (nombres gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_entrenadores_apellidos_trgm ON entrenadores USING gin (apellidos gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_entrenadores_cedula_trgm ON entrenadores USING gin (cedula gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_entrenadores_correo_trgm ON entrenadores USING gin (correo gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_rivales_nombre_trgm ON rivales USING gin (nombre gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_rivales_ciudad_trgm ON rivales USING gin (ciudad gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_rivales_pais_trgm ON rivales USING gin (pais gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_usuarios_nombre_usuario_trgm ON usuarios USING gin (nombre_usuario gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_usuarios_correo_trgm ON usuarios USING gin (correo gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_alineaciones_entrenador ON alineaciones (entrenador_id);
CREATE INDEX IF NOT EXISTS idx_detalle_jugador ON detalle_alineacion (jugador_id);
CREATE INDEX IF NOT EXISTS idx_detalle_titulares ON detalle_alineacion (alineacion_id) WHERE titular = TRUE;
CREATE INDEX IF NOT EXISTS idx_estadisticas_jugador ON estadisticas_partido (jugador_id);
