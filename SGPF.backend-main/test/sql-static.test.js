import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('lineup triggers lock both parent rows and guard confirmed deletes', async () => {
  const sql = await readFile('sql/04_triggers.sql', 'utf8');
  assert.match(sql, /WHERE id IN \(OLD\.alineacion_id, NEW\.alineacion_id\)[\s\S]*ORDER BY id[\s\S]*FOR UPDATE/);
  assert.match(sql, /BEFORE INSERT OR UPDATE OR DELETE ON alineaciones/);
  assert.match(sql, /No se puede eliminar una alineación confirmada/);
  assert.match(sql, /STATE_CONFLICT/);
});

test('trigram indexes match individual ILIKE predicates', async () => {
  const schema = await readFile('sql/01_schema.sql', 'utf8');
  const repository = await readFile('src/repositories/crud.repository.js', 'utf8');
  assert.match(repository, /\.\$\{field\} ILIKE/);
  assert.match(schema, /USING gin \(nombres gin_trgm_ops\)/);
  assert.match(schema, /USING gin \(correo gin_trgm_ops\)/);
  assert.doesNotMatch(schema, /\|\| ' ' \|\|/);
});
