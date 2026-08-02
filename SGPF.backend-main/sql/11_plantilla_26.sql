INSERT INTO jugadores (nombres, apellidos, cedula, fecha_nacimiento, posicion, dorsal, nacionalidad, foto_url, estado_deportivo, condicion_fisica, activo)
VALUES
('Alexander', 'Dominguez', '0701000016', '1987-06-05', 'Portero', 16, 'Ecuatoriana', '/players/16.jpg', 'Disponible', 93, TRUE),
('Moises', 'Ramirez', '0701000017', '2000-09-09', 'Portero', 17, 'Ecuatoriana', '/players/17.jpg', 'Disponible', 95, TRUE),
('Felix', 'Torres', '0701000018', '1997-01-11', 'Defensa', 18, 'Ecuatoriana', '/players/18.jpg', 'Disponible', 94, TRUE),
('Xavier', 'Arreaga', '0701000019', '1994-09-28', 'Defensa', 19, 'Ecuatoriana', '/players/19.jpg', 'Disponible', 90, TRUE),
('Joel', 'Ordonez', '0701000020', '2004-04-21', 'Defensa', 20, 'Ecuatoriana', '/players/20.jpg', 'Disponible', 97, TRUE),
('Jackson', 'Porozo', '0701000021', '2000-08-04', 'Defensa', 21, 'Ecuatoriana', '/players/21.jpg', 'Disponible', 92, TRUE),
('Alan', 'Minda', '0701000022', '2003-05-14', 'Mediocampista', 22, 'Ecuatoriana', '/players/22.jpg', 'Disponible', 96, TRUE),
('Angel', 'Mena', '0701000023', '1988-01-21', 'Mediocampista', 23, 'Ecuatoriana', '/players/23.jpg', 'Disponible', 89, TRUE),
('Jordy', 'Caicedo', '0701000024', '1997-11-18', 'Delantero', 24, 'Ecuatoriana', '/players/24.jpg', 'Disponible', 93, TRUE),
('Leonardo', 'Campana', '0701000025', '2000-07-24', 'Delantero', 25, 'Ecuatoriana', '/players/25.jpg', 'Disponible', 95, TRUE),
('John', 'Yeboah', '0701000026', '2000-06-23', 'Delantero', 26, 'Ecuatoriana', '/players/26.jpg', 'Disponible', 94, TRUE)
ON CONFLICT (cedula) DO UPDATE SET
  nombres=EXCLUDED.nombres, apellidos=EXCLUDED.apellidos, fecha_nacimiento=EXCLUDED.fecha_nacimiento,
  posicion=EXCLUDED.posicion, dorsal=EXCLUDED.dorsal, nacionalidad=EXCLUDED.nacionalidad,
  foto_url=EXCLUDED.foto_url, estado_deportivo=EXCLUDED.estado_deportivo,
  condicion_fisica=EXCLUDED.condicion_fisica, activo=TRUE;
