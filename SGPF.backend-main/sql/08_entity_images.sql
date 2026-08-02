BEGIN;

ALTER TABLE jugadores ADD COLUMN IF NOT EXISTS foto_url varchar(500);
ALTER TABLE entrenadores ADD COLUMN IF NOT EXISTS foto_url varchar(500);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS foto_url varchar(500);
ALTER TABLE rivales ADD COLUMN IF NOT EXISTS foto_url varchar(500);

UPDATE jugadores
SET foto_url = 'https://ui-avatars.com/api/?size=256&bold=true&background=123d25&color=ffffff&name=' ||
  replace(nombres || '+' || apellidos, ' ', '+')
WHERE foto_url IS NULL OR foto_url = '';

UPDATE jugadores j SET foto_url = f.url
FROM (VALUES
  ('0701000001', 'https://randomuser.me/api/portraits/men/32.jpg'),
  ('0701000002', 'https://randomuser.me/api/portraits/men/46.jpg'),
  ('0701000003', 'https://randomuser.me/api/portraits/men/52.jpg'),
  ('0701000004', 'https://randomuser.me/api/portraits/men/61.jpg'),
  ('0701000005', 'https://randomuser.me/api/portraits/men/75.jpg'),
  ('0701000006', 'https://randomuser.me/api/portraits/men/22.jpg'),
  ('0701000007', 'https://randomuser.me/api/portraits/men/36.jpg'),
  ('0701000008', 'https://randomuser.me/api/portraits/men/44.jpg'),
  ('0701000009', 'https://randomuser.me/api/portraits/men/53.jpg'),
  ('0701000010', 'https://randomuser.me/api/portraits/men/64.jpg'),
  ('0701000011', 'https://randomuser.me/api/portraits/men/71.jpg'),
  ('0701000012', 'https://randomuser.me/api/portraits/men/80.jpg'),
  ('0701000013', 'https://randomuser.me/api/portraits/men/15.jpg'),
  ('0701000014', 'https://randomuser.me/api/portraits/men/28.jpg'),
  ('0701000015', 'https://randomuser.me/api/portraits/men/39.jpg')
) AS f(cedula, url)
WHERE j.cedula = f.cedula;

-- Plantilla de futbolistas ecuatorianos reales con retratos de Wikimedia Commons.
UPDATE jugadores j
SET nombres = f.nombres,
    apellidos = f.apellidos,
    fecha_nacimiento = f.fecha_nacimiento,
    posicion = f.posicion,
    foto_url = f.foto_url
FROM (VALUES
  ('0701000001', 'Hernán', 'Galíndez', DATE '1987-03-30', 'Portero', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Hernan_Galindez_Cote_D%27Ivoire_v_Ecuador_14_June_2026-96.jpg/500px-Hernan_Galindez_Cote_D%27Ivoire_v_Ecuador_14_June_2026-96.jpg'),
  ('0701000002', 'Ángelo', 'Preciado', DATE '1998-02-18', 'Defensa', 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Angelo_Preciado_Cote_D%27Ivoire_v_Ecuador_14_June_2026-31.jpg/500px-Angelo_Preciado_Cote_D%27Ivoire_v_Ecuador_14_June_2026-31.jpg'),
  ('0701000003', 'Piero', 'Hincapié', DATE '2002-01-09', 'Defensa', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Piero_Hincapie_Cote_D%27Ivoire_v_Ecuador_14_June_2026-247_%28cropped%29.jpg/500px-Piero_Hincapie_Cote_D%27Ivoire_v_Ecuador_14_June_2026-247_%28cropped%29.jpg'),
  ('0701000004', 'Willian', 'Pacho', DATE '2001-10-16', 'Defensa', 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Willian_Pacho_Cote_D%27Ivoire_v_Ecuador_14_June_2026-115_%28cropped%29.jpg/500px-Willian_Pacho_Cote_D%27Ivoire_v_Ecuador_14_June_2026-115_%28cropped%29.jpg'),
  ('0701000005', 'Pervis', 'Estupiñán', DATE '1998-01-21', 'Defensa', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Pervis_Estupinan_Cote_D%27Ivoire_v_Ecuador_14_June_2026-73.jpg/500px-Pervis_Estupinan_Cote_D%27Ivoire_v_Ecuador_14_June_2026-73.jpg'),
  ('0701000006', 'Moisés', 'Caicedo', DATE '2001-11-02', 'Mediocampista', 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Moises_Caicedo_Ecuador_v_Germany_25_June_2026-051_%28cropped%29.jpg/500px-Moises_Caicedo_Ecuador_v_Germany_25_June_2026-051_%28cropped%29.jpg'),
  ('0701000007', 'Carlos', 'Gruezo', DATE '1995-04-19', 'Mediocampista', 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Carlos_gruezo.jpg/500px-Carlos_gruezo.jpg'),
  ('0701000008', 'Kendry', 'Páez', DATE '2007-05-04', 'Mediocampista', 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Kendry_Paez_Cote_D%27Ivoire_v_Ecuador_14_June_2026-37_%28cropped%29.jpg/500px-Kendry_Paez_Cote_D%27Ivoire_v_Ecuador_14_June_2026-37_%28cropped%29.jpg'),
  ('0701000009', 'Gonzalo', 'Plata', DATE '2000-11-01', 'Delantero', 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Gonzalo_Plata_Cote_D%27Ivoire_v_Ecuador_14_June_2026-12_%28cropped%29.jpg/500px-Gonzalo_Plata_Cote_D%27Ivoire_v_Ecuador_14_June_2026-12_%28cropped%29.jpg'),
  ('0701000010', 'Enner', 'Valencia', DATE '1989-11-04', 'Delantero', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Enner_Valencia_Cote_D%27Ivoire_v_Ecuador_14_June_2026-95.jpg/500px-Enner_Valencia_Cote_D%27Ivoire_v_Ecuador_14_June_2026-95.jpg'),
  ('0701000011', 'Kevin', 'Rodríguez', DATE '2000-03-04', 'Delantero', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Kevin_Rodriguez_Cote_D%27Ivoire_v_Ecuador_14_June_2026-212.jpg/500px-Kevin_Rodriguez_Cote_D%27Ivoire_v_Ecuador_14_June_2026-212.jpg'),
  ('0701000012', 'Robert', 'Arboleda', DATE '1991-10-22', 'Defensa', 'https://upload.wikimedia.org/wikipedia/commons/7/76/Robert_Arboleda_-_16_de_setembro_de_2018.jpg'),
  ('0701000013', 'José', 'Cifuentes', DATE '1999-03-12', 'Mediocampista', 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Jose_Cifuentes_2023.jpg/500px-Jose_Cifuentes_2023.jpg'),
  ('0701000014', 'Jeremy', 'Sarmiento', DATE '2002-06-16', 'Mediocampista', 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/BHA_5_v_Espanyol_1_pre_season_30_07_2022_160.jpg/500px-BHA_5_v_Espanyol_1_pre_season_30_07_2022_160.jpg'),
  ('0701000015', 'Fernando', 'Gaibor', DATE '1991-10-08', 'Mediocampista', 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/EMELEC_GANA_SU_ESTRELLA_N%C3%9AMERO_14_%2824259191747%29_%28cropped%29.jpg/500px-EMELEC_GANA_SU_ESTRELLA_N%C3%9AMERO_14_%2824259191747%29_%28cropped%29.jpg')
) AS f(cedula, nombres, apellidos, fecha_nacimiento, posicion, foto_url)
WHERE j.cedula = f.cedula;

-- El frontend sirve copias locales para evitar límites y demoras del servidor remoto.
UPDATE jugadores
SET foto_url = '/players/' || dorsal || '.jpg';

UPDATE entrenadores
SET foto_url = 'https://ui-avatars.com/api/?size=256&bold=true&background=b99a45&color=ffffff&name=' ||
  replace(nombres || '+' || apellidos, ' ', '+')
WHERE foto_url IS NULL OR foto_url = '';

UPDATE entrenadores e SET foto_url = f.url
FROM (VALUES
  ('0702000001', 'https://randomuser.me/api/portraits/men/11.jpg'),
  ('0702000002', 'https://randomuser.me/api/portraits/men/18.jpg'),
  ('0702000003', 'https://randomuser.me/api/portraits/men/24.jpg'),
  ('0702000004', 'https://randomuser.me/api/portraits/men/30.jpg')
) AS f(cedula, url)
WHERE e.cedula = f.cedula;

UPDATE usuarios
SET foto_url = 'https://ui-avatars.com/api/?size=256&bold=true&background=123d25&color=ffffff&name=' ||
  replace(nombre_usuario, ' ', '+')
WHERE foto_url IS NULL OR foto_url = '';

UPDATE rivales
SET foto_url = 'https://ui-avatars.com/api/?size=256&bold=true&rounded=true&background=eeeeee&color=123d25&name=' ||
  replace(nombre, ' ', '+')
WHERE foto_url IS NULL OR foto_url = '';

COMMIT;
