import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { pool } from '../src/database/connection.js';

const withServer = async (handler) => {
  const app = createApp();
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();
  try {
    await handler(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
};

test('basic HTTP contracts and request id', async () => {
  await withServer(async (base) => {
    const response = await fetch(`${base}/health`);
    assert.equal(response.status, 200);
    assert.ok(response.headers.get('x-request-id'));
    assert.deepEqual(await response.json(), { status: 'ok' });
  });
});

test('invalid JSON maps to 400 without leaking internals', async () => {
  await withServer(async (base) => {
    const response = await fetch(`${base}/api/rivales`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{bad' });
    const body = await response.json();
    assert.equal(response.status, 400);
    assert.equal(body.codigo, 'BAD_REQUEST');
    assert.equal(body.mensaje, 'JSON inválido');
  });
});

test('oversized JSON maps to 413', async () => {
  await withServer(async (base) => {
    const response = await fetch(`${base}/api/rivales`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ nombre: 'x'.repeat(300000) }) });
    const body = await response.json();
    assert.equal(response.status, 413);
    assert.equal(body.codigo, 'PAYLOAD_TOO_LARGE');
  });
});

test('PUT empty and stale contracts are exposed over HTTP', async () => {
  const original = pool.query;
  let mode = 'current';
  pool.query = async () => (mode === 'current' ? { rowCount: 1, rows: [{ '?column?': 1 }] } : { rowCount: 0, rows: [] });
  try {
    await withServer(async (base) => {
      let response = await fetch(`${base}/api/rivales/11111111-1111-4111-8111-111111111111`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ version: 1 }) });
      assert.equal(response.status, 400);
      mode = 'stale';
      response = await fetch(`${base}/api/rivales/11111111-1111-4111-8111-111111111111`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ version: 1 }) });
      assert.equal(response.status, 409);
    });
  } finally {
    pool.query = original;
  }
});

test('non-nullable null is rejected over HTTP', async () => {
  await withServer(async (base) => {
    const response = await fetch(`${base}/api/rivales`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ nombre: null, ciudad: 'Machala' }) });
    assert.equal(response.status, 400);
  });
});

test('report endpoints return global total from repository rows', async () => {
  const original = pool.query;
  pool.query = async () => ({ rows: [{ jugador_id: '22222222-2222-4222-8222-222222222222', goles: 1, __total: 7 }] });
  try {
    await withServer(async (base) => {
      const response = await fetch(`${base}/api/reportes/jugadores/rendimiento`);
      const body = await response.json();
      assert.equal(response.status, 200);
      assert.equal(body.total, 7);
      assert.equal(body.jugadores.length, 1);
    });
  } finally {
    pool.query = original;
  }
});

test('report endpoints keep global total on empty pages', async () => {
  const original = pool.query;
  let calls = 0;
  pool.query = async () => {
    calls += 1;
    return calls === 1 ? { rows: [] } : { rows: [{ total: 7 }] };
  };
  try {
    await withServer(async (base) => {
      const response = await fetch(`${base}/api/reportes/partidos/resumen?offset=99`);
      const body = await response.json();
      assert.equal(response.status, 200);
      assert.equal(body.total, 7);
      assert.equal(body.partidos.length, 0);
    });
  } finally {
    pool.query = original;
  }
});

test('nine entity routes are mounted', async () => {
  const original = pool.query;
  pool.query = async (sql) => {
    if (String(sql).includes('COUNT(*) OVER()')) return { rows: [] };
    if (String(sql).includes('COUNT(*)::integer')) return { rows: [{ total: 0 }] };
    return { rows: [{ '?column?': 1 }] };
  };
  try {
    await withServer(async (base) => {
      const paths = ['roles', 'usuarios', 'jugadores', 'entrenadores', 'rivales', 'partidos', 'alineaciones', 'detalle-alineacion', 'estadisticas-partido'];
      for (const path of paths) {
        const response = await fetch(`${base}/api/${path}`);
        assert.equal(response.status, 200, path);
      }
    });
  } finally {
    pool.query = original;
  }
});
