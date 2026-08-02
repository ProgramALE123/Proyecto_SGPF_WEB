import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import pg from 'pg';

const connectionString = process.env.SGPF_TEST_DATABASE_URL;
const databaseName = connectionString ? new URL(connectionString).pathname.slice(1) : '';
const allowSchemaReset = process.env.SGPF_TEST_ALLOW_SCHEMA_RESET === 'true';
const skipReason = !connectionString
  ? 'Set SGPF_TEST_DATABASE_URL explicitly to run PostgreSQL integration tests'
  : !databaseName.endsWith('_test')
    ? 'SGPF_TEST_DATABASE_URL database name must end with _test'
    : !allowSchemaReset
      ? 'Set SGPF_TEST_ALLOW_SCHEMA_RESET=true to allow a temporary schema for this run'
      : false;
const canRun = skipReason === false;

const quoteIdent = (value) => `"${String(value).replaceAll('"', '""')}"`;

const withIsolatedSchema = async (callback) => {
  const schema = `sgpf_it_${process.pid}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  const client = new pg.Client({ connectionString });
  await client.connect();
  try {
    await client.query(`CREATE SCHEMA ${quoteIdent(schema)}`);
    await client.query(`SET search_path TO ${quoteIdent(schema)}, public`);
    await runInstall(client);
    await callback(client, schema);
  } finally {
    try {
      await client.query(`DROP SCHEMA IF EXISTS ${quoteIdent(schema)} CASCADE`);
    } finally {
      await client.end();
    }
  }
};

const connectInSchema = async (schema) => {
  const client = new pg.Client({ connectionString });
  await client.connect();
  await client.query(`SET search_path TO ${quoteIdent(schema)}, public`);
  return client;
};

const runInstall = async (client) => {
  const master = await readFile('sql/00_install_all.sql', 'utf8');
  const includes = [...master.matchAll(/\\ir\s+([^\s]+)/g)].map((match) => `sql/${match[1]}`);
  for (const file of includes) await client.query(await readFile(file, 'utf8'));
};

const seedBase = async (client, suffix) => {
  const role = await client.query("SELECT id FROM roles WHERE nombre = 'director_tecnico' LIMIT 1");
  const user = await client.query('INSERT INTO usuarios (rol_id, nombre_usuario, correo, clave_hash) VALUES ($1, $2, $3, $4) RETURNING id', [role.rows[0].id, `coach_${suffix}`, `coach_${suffix}@test.local`, 'scrypt-v1$salt$hash']);
  const coach = await client.query("INSERT INTO entrenadores (usuario_id, nombres, apellidos, cedula, cargo, fecha_ingreso) VALUES ($1, 'Test', 'Coach', $2, 'Director Técnico', '2026-01-01') RETURNING id", [user.rows[0].id, `CT-${suffix}`]);
  const rival = await client.query('INSERT INTO rivales (nombre, ciudad) VALUES ($1, $2) RETURNING id', [`Rival ${suffix}`, 'Machala']);
  const match = await client.query("INSERT INTO partidos (rival_id, fecha_partido, estadio, condicion) VALUES ($1, '2026-01-10', $2, 'Local') RETURNING id", [rival.rows[0].id, `Estadio ${suffix}`]);
  const lineup = await client.query("INSERT INTO alineaciones (partido_id, entrenador_id, esquema_tactico) VALUES ($1, $2, '4-4-2') RETURNING id", [match.rows[0].id, coach.rows[0].id]);
  return lineup.rows[0].id;
};

const insertPlayers = async (client, suffix, count, lineupId, captainIndex = 0) => {
  for (let i = 0; i < count; i += 1) {
    const player = await client.query("INSERT INTO jugadores (nombres, apellidos, cedula, fecha_nacimiento, posicion, dorsal) VALUES ($1, $2, $3, '2000-01-01', 'Defensa', $4) RETURNING id", [`P${i}`, suffix, `P-${suffix}-${i}`, 20 + i]);
    await client.query('INSERT INTO detalle_alineacion (alineacion_id, jugador_id, posicion_en_campo, titular, capitan) VALUES ($1, $2, $3, TRUE, $4)', [lineupId, player.rows[0].id, `POS-${i}`, i === captainIndex]);
  }
};

test('PostgreSQL install scripts and lineup triggers in isolated temporary schema', { skip: canRun ? false : skipReason }, async () => {
  await withIsolatedSchema(async (client, schema) => {
    const tables = await client.query("SELECT COUNT(*)::integer AS total FROM information_schema.tables WHERE table_schema = $1 AND table_name IN ('roles','usuarios','jugadores','entrenadores','rivales','partidos','alineaciones','detalle_alineacion','estadisticas_partido')", [schema]);
    assert.equal(tables.rows[0].total, 9);

    const suffix = `it_${Date.now()}`;
    const lineup = await seedBase(client, suffix);
    await assert.rejects(() => client.query("INSERT INTO alineaciones (partido_id, entrenador_id, esquema_tactico, confirmado) SELECT partido_id, entrenador_id, '4-4-2', TRUE FROM alineaciones WHERE id = $1", [lineup]), /insertarse confirmada/i);
    await assert.rejects(
      () => client.query('UPDATE alineaciones SET confirmado = TRUE WHERE id = $1', [lineup]),
      /alineación confirmada debe tener exactamente 11 titulares/i
    );
    await insertPlayers(client, suffix, 11, lineup);
    await client.query('UPDATE alineaciones SET confirmado = TRUE WHERE id = $1', [lineup]);
    await assert.rejects(() => client.query('UPDATE alineaciones SET observaciones = $2 WHERE id = $1', [lineup, 'blocked']), /No se puede modificar/);
    await assert.rejects(() => client.query('DELETE FROM alineaciones WHERE id = $1', [lineup]), /No se puede eliminar/);
    await assert.rejects(() => client.query('DELETE FROM detalle_alineacion WHERE alineacion_id = $1', [lineup]), /No se puede modificar el detalle/);
    const secondLineup = await seedBase(client, `${suffix}_target`);
    const detail = await client.query('SELECT id FROM detalle_alineacion WHERE alineacion_id = $1 LIMIT 1', [lineup]);
    await assert.rejects(() => client.query('UPDATE detalle_alineacion SET alineacion_id = $2 WHERE id = $1', [detail.rows[0].id, secondLineup]), /No se puede modificar el detalle/);
  });
});

test('PostgreSQL concurrent lineup detail inserts serialize per parent', { skip: canRun ? false : skipReason }, async () => {
  await withIsolatedSchema(async (setup, schema) => {
    const suffix = `race_${Date.now()}`;
    const lineup = await seedBase(setup, suffix);
    const players = [];
    for (let i = 0; i < 12; i += 1) {
      const player = await setup.query("INSERT INTO jugadores (nombres, apellidos, cedula, fecha_nacimiento, posicion, dorsal) VALUES ($1, $2, $3, '2000-01-01', 'Defensa', $4) RETURNING id", [`R${i}`, suffix, `R-${suffix}-${i}`, 40 + i]);
      players.push(player.rows[0].id);
    }

  const a = await connectInSchema(schema);
  const b = await connectInSchema(schema);
  try {
    const insertSet = async (client, slice, label) => {
      await client.query('BEGIN');
      try {
        for (let i = 0; i < slice.length; i += 1) {
          await client.query('INSERT INTO detalle_alineacion (alineacion_id, jugador_id, posicion_en_campo, titular, capitan) VALUES ($1, $2, $3, TRUE, FALSE)', [lineup, slice[i], `${label}-${i}`]);
        }
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    };
    const results = await Promise.allSettled([insertSet(a, players.slice(0, 6), 'A'), insertSet(b, players.slice(6), 'B')]);
    assert.ok(results.some((result) => result.status === 'rejected'));
  } finally {
    await Promise.all([a.end(), b.end()]);
  }
  });
});
