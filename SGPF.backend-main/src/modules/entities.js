export const entities = {
  roles: {
    table: 'roles', label: 'rol', orderBy: 'nombre ASC', searchable: ['nombre'], allowedFilters: ['activo'],
    fields: ['nombre', 'descripcion', 'activo'],
    schema: { nombre: { type: 'string', required: true, max: 50, values: ['secretario_tecnico', 'director_tecnico', 'presidente_club'] }, descripcion: { type: 'string', max: 200 }, activo: { type: 'boolean' } }
  },
  usuarios: {
    table: 'usuarios', label: 'usuario', orderBy: 'nombre_usuario ASC', hidden: ['clave_hash'], searchable: ['nombre_usuario', 'correo'], allowedFilters: ['rol_id', 'activo'],
    fields: ['rol_id', 'nombre_usuario', 'correo', 'clave_hash', 'foto_url', 'activo', 'ultimo_acceso'],
    schema: { rol_id: { type: 'uuid', required: true }, nombre_usuario: { type: 'string', required: true, min: 4, max: 50 }, correo: { type: 'string', required: true, max: 120, email: true }, clave: { type: 'string', required: true, min: 8, max: 128 }, foto_url: { type: 'string', max: 500, nullable: true }, activo: { type: 'boolean' }, ultimo_acceso: { type: 'date', nullable: true } }
  },
  jugadores: {
    table: 'jugadores', label: 'jugador', orderBy: 'apellidos ASC, nombres ASC', searchable: ['nombres', 'apellidos', 'cedula'], allowedFilters: ['posicion', 'activo'],
    fields: ['nombres', 'apellidos', 'cedula', 'fecha_nacimiento', 'posicion', 'dorsal', 'nacionalidad', 'foto_url', 'estado_deportivo', 'condicion_fisica', 'observaciones_medicas', 'activo'],
    schema: { nombres: { type: 'string', required: true, max: 80 }, apellidos: { type: 'string', required: true, max: 80 }, cedula: { type: 'string', required: true, max: 20 }, fecha_nacimiento: { type: 'date', required: true }, posicion: { type: 'string', required: true, max: 40, values: ['Portero', 'Defensa', 'Mediocampista', 'Delantero'] }, dorsal: { type: 'integer', required: true, min: 1, max: 99 }, nacionalidad: { type: 'string', max: 60 }, foto_url: { type: 'string', max: 500, nullable: true }, estado_deportivo: { type: 'string', values: ['Disponible', 'Lesionado', 'Suspendido', 'Recuperacion'] }, condicion_fisica: { type: 'integer', min: 0, max: 100 }, observaciones_medicas: { type: 'string', max: 300, nullable: true }, activo: { type: 'boolean' } }
  },
  entrenadores: {
    table: 'entrenadores', label: 'entrenador', orderBy: 'apellidos ASC, nombres ASC', searchable: ['nombres', 'apellidos', 'cedula', 'correo'], allowedFilters: ['cargo', 'activo', 'usuario_id'],
    fields: ['usuario_id', 'nombres', 'apellidos', 'cedula', 'telefono', 'correo', 'cargo', 'fecha_ingreso', 'foto_url', 'activo'],
    schema: { usuario_id: { type: 'uuid', nullable: true }, nombres: { type: 'string', required: true, max: 80 }, apellidos: { type: 'string', required: true, max: 80 }, cedula: { type: 'string', required: true, max: 20 }, telefono: { type: 'string', max: 30, nullable: true }, correo: { type: 'string', max: 120, email: true, nullable: true }, cargo: { type: 'string', required: true, max: 60, values: ['Director Técnico', 'Asistente Técnico', 'Preparador Físico', 'Entrenador de Arqueros'] }, fecha_ingreso: { type: 'date', required: true }, foto_url: { type: 'string', max: 500, nullable: true }, activo: { type: 'boolean' } }
  },
  rivales: {
    table: 'rivales', label: 'rival', orderBy: 'nombre ASC', searchable: ['nombre', 'ciudad', 'pais'], allowedFilters: ['activo', 'pais'],
    fields: ['nombre', 'ciudad', 'pais', 'foto_url', 'activo'],
    schema: { nombre: { type: 'string', required: true, max: 100 }, ciudad: { type: 'string', required: true, max: 80 }, pais: { type: 'string', max: 80 }, foto_url: { type: 'string', max: 500, nullable: true }, activo: { type: 'boolean' } }
  },
  partidos: {
    table: 'partidos', label: 'partido', orderBy: 'fecha_partido DESC', allowedFilters: ['rival_id', 'finalizado', 'condicion'],
    fields: ['rival_id', 'fecha_partido', 'estadio', 'condicion', 'goles_orense', 'goles_rival', 'finalizado', 'observaciones'],
    joins: 'JOIN rivales r ON r.id = partidos.rival_id', select: 'partidos.*, r.nombre AS rival_nombre, r.foto_url AS rival_foto_url',
    schema: { rival_id: { type: 'uuid', required: true }, fecha_partido: { type: 'date', required: true }, estadio: { type: 'string', required: true, max: 120 }, condicion: { type: 'string', required: true, values: ['Local', 'Visitante', 'Neutral'] }, goles_orense: { type: 'integer', min: 0 }, goles_rival: { type: 'integer', min: 0 }, finalizado: { type: 'boolean' }, observaciones: { type: 'string', max: 300, nullable: true } }
  },
  alineaciones: {
    table: 'alineaciones', label: 'alineación', orderBy: 'creado_en DESC', allowedFilters: ['partido_id', 'entrenador_id', 'confirmado'],
    fields: ['partido_id', 'entrenador_id', 'esquema_tactico', 'observaciones', 'confirmado'],
    schema: { partido_id: { type: 'uuid', required: true }, entrenador_id: { type: 'uuid', required: true }, esquema_tactico: { type: 'string', required: true, values: ['4-4-2', '4-3-3', '3-5-2', '4-2-3-1', '5-3-2', '3-4-3'] }, observaciones: { type: 'string', max: 300, nullable: true }, confirmado: { type: 'boolean' } }
  },
  detalle_alineacion: {
    table: 'detalle_alineacion', label: 'detalle de alineación', orderBy: 'titular DESC, posicion_en_campo ASC', allowedFilters: ['alineacion_id', 'jugador_id', 'titular'],
    fields: ['alineacion_id', 'jugador_id', 'posicion_en_campo', 'slot_indice', 'titular', 'capitan', 'minuto_ingreso', 'minuto_salida'],
    schema: { alineacion_id: { type: 'uuid', required: true }, jugador_id: { type: 'uuid', required: true }, posicion_en_campo: { type: 'string', required: true, max: 40 }, slot_indice: { type: 'integer', min: 0, max: 10, nullable: true }, titular: { type: 'boolean' }, capitan: { type: 'boolean' }, minuto_ingreso: { type: 'integer', min: 0, max: 120 }, minuto_salida: { type: 'integer', min: 1, max: 120, nullable: true } }
  },
  estadisticas_partido: {
    table: 'estadisticas_partido', label: 'estadística de partido', orderBy: 'creado_en DESC', allowedFilters: ['partido_id', 'jugador_id'],
    fields: ['partido_id', 'jugador_id', 'minutos_jugados', 'goles', 'asistencias', 'tarjetas_amarillas', 'tarjetas_rojas', 'calificacion'],
    schema: { partido_id: { type: 'uuid', required: true }, jugador_id: { type: 'uuid', required: true }, minutos_jugados: { type: 'integer', min: 0, max: 120 }, goles: { type: 'integer', min: 0 }, asistencias: { type: 'integer', min: 0 }, tarjetas_amarillas: { type: 'integer', min: 0, max: 2 }, tarjetas_rojas: { type: 'integer', min: 0, max: 1 }, calificacion: { type: 'integer', min: 1, max: 10, nullable: true } }
  }
};
