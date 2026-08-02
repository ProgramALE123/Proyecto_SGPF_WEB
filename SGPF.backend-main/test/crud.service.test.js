import test from 'node:test';
import assert from 'node:assert/strict';
import { createCrudService } from '../src/services/crud.service.js';
import { entities } from '../src/modules/entities.js';
import { isPasswordHash, verifyPassword } from '../src/utils/passwords.js';
import { createAlineacionesService } from '../src/services/alineaciones.service.js';
import { mapPostgresError } from '../src/utils/errors.js';

test('list forwards filters and pagination to repository', async () => {
  let received;
  const service = createCrudService(entities.jugadores, {
    findAll: async (args) => {
      received = args;
      return { total: 0, data: [] };
    }
  });
  const result = await service.list({ limit: '5', offset: '2', posicion: 'Defensa', activo: 'true' });
  assert.equal(result.total, 0);
  assert.deepEqual(received, { filters: { posicion: 'Defensa', activo: true }, limit: 5, offset: 2 });
});

test('update reports 409 conflict when repository returns no row for stale version', async () => {
  const service = createCrudService(entities.rivales, {
    update: async () => undefined
  });
  await assert.rejects(
    () => service.update('11111111-1111-4111-8111-111111111111', { nombre: 'Liga', ciudad: 'Quito', version: 1 }),
    (error) => error.statusCode === 409 && /versión obsoleta/.test(error.message)
  );
});

test('delete requires version for optimistic concurrency', async () => {
  const service = createCrudService(entities.rivales, { remove: async () => ({}) });
  await assert.rejects(
    () => service.remove('11111111-1111-4111-8111-111111111111', {}),
    (error) => error.statusCode === 400 && /version es obligatoria/.test(error.message)
  );
});

test('update with no mutable fields checks version before returning 400', async () => {
  let checked = false;
  const service = createCrudService(entities.rivales, { existsWithVersion: async () => { checked = true; return true; } });
  await assert.rejects(() => service.update('11111111-1111-4111-8111-111111111111', { version: 1 }), (error) => error.statusCode === 400);
  assert.equal(checked, true);
});

test('stale empty update returns 409', async () => {
  const service = createCrudService(entities.rivales, { existsWithVersion: async () => false });
  await assert.rejects(() => service.update('11111111-1111-4111-8111-111111111111', { version: 1 }), (error) => error.statusCode === 409);
});

test('usuario create hashes clave and rejects caller supplied clave_hash', async () => {
  let saved;
  const service = createCrudService(entities.usuarios, { create: async (payload) => { saved = payload; return { id: '1', ...payload }; } });
  await service.create({ rol_id: '11111111-1111-4111-8111-111111111111', nombre_usuario: 'usuario1', correo: 'u@example.com', clave: 'super-secret' });
  assert.equal(saved.clave, undefined);
  assert.equal(isPasswordHash(saved.clave_hash), true);
  assert.equal(await verifyPassword('super-secret', saved.clave_hash), true);
  await assert.rejects(() => service.create({ clave_hash: 'raw' }), /clave_hash no se acepta/);
});

test('confirmed empty lineup creation is rejected before persisting', async () => {
  const service = createAlineacionesService({});
  await assert.rejects(
    () => service.create({
      partido_id: '11111111-1111-4111-8111-111111111111',
      entrenador_id: '22222222-2222-4222-8222-222222222222',
      esquema_tactico: '4-4-2',
      confirmado: true,
      detalles: []
    }),
    /debe incluir detalles/
  );
});

test('foreign key violations map to 409 conflict safely', () => {
  const mapped = mapPostgresError({ code: '23503', detail: 'sensitive db detail' });
  assert.equal(mapped.statusCode, 409);
  assert.equal(mapped.code, 'CONFLICT');
  assert.doesNotMatch(mapped.message, /sensitive/);
});
