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
  const existingSchema = await pool.query("SELECT to_regclass('public.roles') AS roles_table");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sgpf_migrations (
      script VARCHAR(100) PRIMARY KEY,
      aplicado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const migrationCount = await pool.query('SELECT COUNT(*)::int AS total FROM sgpf_migrations');
  if (existingSchema.rows[0].roles_table && migrationCount.rows[0].total === 0) {
    for (const script of scripts) {
      await pool.query('INSERT INTO sgpf_migrations (script) VALUES ($1) ON CONFLICT DO NOTHING', [script]);
    }
    console.log('Base de datos existente registrada; no se duplicaron datos');
  }

  for (const script of scripts) {
    const applied = await pool.query('SELECT 1 FROM sgpf_migrations WHERE script = $1', [script]);
    if (applied.rowCount) {
      console.log(`Base de datos: ${script} ya estaba aplicado`);
      continue;
    }
    const sql = await fs.readFile(path.join(directory, script), 'utf8');
    await pool.query(sql);
    await pool.query('INSERT INTO sgpf_migrations (script) VALUES ($1)', [script]);
    console.log(`Base de datos: ${script} aplicado`);
  }
} catch (error) {
  console.error('No se pudo instalar la base de datos:', error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
