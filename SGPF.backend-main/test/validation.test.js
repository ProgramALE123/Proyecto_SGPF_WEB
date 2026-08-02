import test from 'node:test';
import assert from 'node:assert/strict';
import { parsePagination, validatePayload } from '../src/utils/validation.js';
import { entities } from '../src/modules/entities.js';

test('parsePagination applies defaults and caps limit', () => {
  assert.deepEqual(parsePagination({}), { limit: 20, offset: 0 });
  assert.deepEqual(parsePagination({ limit: '500', offset: '10' }), { limit: 100, offset: 10 });
});

test('parsePagination rejects invalid values', () => {
  assert.throws(() => parsePagination({ limit: '0' }), /limit debe ser/);
  assert.throws(() => parsePagination({ offset: '-1' }), /offset debe ser/);
});

test('validatePayload enforces player domain constraints', () => {
  const payload = validatePayload(entities.jugadores.schema, {
    nombres: 'Juan',
    apellidos: 'Paredes',
    cedula: '0999999999',
    fecha_nacimiento: '2001-01-10',
    posicion: 'Delantero',
    dorsal: 9
  });
  assert.equal(payload.posicion, 'Delantero');
  assert.equal(payload.dorsal, 9);
  assert.throws(() => validatePayload(entities.jugadores.schema, { ...payload, posicion: 'Arquero' }), /valor no permitido/);
  assert.throws(() => validatePayload(entities.jugadores.schema, { ...payload, dorsal: 100 }), /menor o igual/);
});

test('validatePayload distinguishes null from absent for nullable fields', () => {
  const payload = validatePayload(entities.entrenadores.schema, { telefono: null }, { partial: true });
  assert.deepEqual(payload, { telefono: null });
  assert.throws(() => validatePayload(entities.rivales.schema, { nombre: null }, { partial: true }), /no puede ser null/);
});

test('validatePayload rejects impossible dates', () => {
  assert.throws(() => validatePayload(entities.jugadores.schema, { fecha_nacimiento: '2026-02-31' }, { partial: true }), /fecha válida/);
});

test('validatePayload rejects invalid usuario email and short username', () => {
  const roleId = '11111111-1111-4111-8111-111111111111';
  assert.throws(() => validatePayload(entities.usuarios.schema, {
    rol_id: roleId,
    nombre_usuario: 'abc',
    correo: 'sin-arroba',
    clave: '12345678'
  }), /nombre_usuario/);
});
