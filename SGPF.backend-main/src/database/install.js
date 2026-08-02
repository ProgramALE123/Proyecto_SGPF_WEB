import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from './connection.js';

const directory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../sql');
const scripts = [
  '01_schema.sql',
  '02_views.sql',
  '03_functions.sql',
  '04_triggers.sql',
  '05_seeds.sql',
  '07_demo_data.sql',
  '08_entity_images.sql',
  '09_formacion_343.sql',
  '10_estado_jugadores.sql',
  '11_plantilla_26.sql',
  '12_slot_alineacion.sql',
  '13_proximos_partidos.sql'
];

try {
  for (const script of scripts) {
    const sql = await fs.readFile(path.join(directory, script), 'utf8');
    await pool.query(sql);
    console.log(`Base de datos: ${script} aplicado`);
  }
} catch (error) {
  console.error('No se pudo instalar la base de datos:', error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
