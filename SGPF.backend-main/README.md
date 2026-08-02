# SGPF Backend

Backend REST for SGPF built with Node.js ES Modules, Express, `pg`, `dotenv`, and PostgreSQL.

## Local setup with PostgreSQL / pgAdmin

1. Create scoped local roles and a database from pgAdmin using a privileged local administrator only for setup:

```sql
CREATE ROLE sgpf_owner LOGIN PASSWORD '<strong-owner-password>';
CREATE ROLE sgpf_app LOGIN PASSWORD '<strong-runtime-password>';
CREATE DATABASE sgpf OWNER sgpf_owner;
GRANT CONNECT ON DATABASE sgpf TO sgpf_app;
```

2. Run installation SQL as `sgpf_owner`, then grant runtime permissions:

```sql
GRANT USAGE ON SCHEMA public TO sgpf_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO sgpf_app;
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC;
```

`sgpf_owner` is the owner/migrator role used for schema scripts. `sgpf_app` is the runtime role used by the API. Do not grant default privileges on future tables; after each migration, grant only the permissions required by the new API operations. The current API reads report views directly and does not call the helper functions, so runtime `EXECUTE` is not granted by default. If a future endpoint calls a specific function, grant only that function, for example `GRANT EXECUTE ON FUNCTION fn_resumen_jugador(uuid) TO sgpf_app;`.

3. Copy `.env.example` to `.env` and set the `sgpf_app` credentials. Do not use the PostgreSQL superuser for the application.
4. In pgAdmin Query Tool, run the SQL files in this order:
   - `sql/00_install_all.sql` only when using a psql-compatible runner that supports `\ir` includes, or
   - the pgAdmin-safe sequence below:
   - `sql/01_schema.sql`
   - `sql/02_views.sql`
   - `sql/03_functions.sql`
   - `sql/04_triggers.sql`
   - `sql/05_seeds.sql`
   - Optional diagnostics: `sql/06_explain.sql`

For local development rollback/reset only, use `sql/99_dev_reset.sql` against disposable databases. Prefer fix-forward scripts for shared databases.

5. Install and run:

```bash
npm install
npm run dev
```

Production-like start:

```bash
npm start
```

Tests:

```bash
npm test
```

## API

Base path: `/api`. Auth/authz is intentionally out of scope because the reference backend has no authentication stack. Bind development to `HOST=127.0.0.1`; CORS only controls browser access and is not a security boundary.

Entities:

- `/api/roles`
- `/api/usuarios` accepts `clave` and stores a versioned `scrypt` hash with random salt; responses never include `clave_hash`. HTTP callers must not send `clave_hash`.
- `/api/jugadores`
- `/api/entrenadores`
- `/api/rivales`
- `/api/partidos`
- `/api/alineaciones`
- `/api/detalle-alineacion`
- `/api/estadisticas-partido`

Common endpoints: `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `PATCH /:id`, `DELETE /:id`.

List endpoints accept `limit` and `offset` plus entity filters. `limit` is capped at 100 and `offset` at 10000. Ordering includes `id` as a stable tie-breaker.

Updates and deletes use optimistic concurrency. Send the current `version` in the JSON body for `PUT`, `PATCH`, and `DELETE`. If the version is obsolete, the API returns `409`; if the version is current but no mutable field is sent, the API returns `400`.

## Reports, views, functions, and triggers

Useful report endpoints:

- `GET /api/reportes/jugadores/rendimiento`
- `GET /api/reportes/partidos/resumen`
- `GET /api/reportes/alineaciones/:partido_id`

Views:

- `vw_jugadores_rendimiento`: player aggregate match minutes, goals, assists, cards, and average rating.
- `vw_partidos_resumen`: match list with rival name, result, and outcome.
- `vw_alineaciones_detalle`: lineups with coach, player, field position, starter, and captain information.

Functions:

- `fn_resumen_jugador(uuid)`: player summary for reports.
- `fn_partido_marcador(uuid)`: match score label.
- `fn_jugadores_disponibles_alineacion(uuid)`: active players not yet assigned to a lineup.

Triggers:

- Keep `version` incrementing on row updates.
- Protect lineup invariants with short parent-row locks: max 11 starters while editing, captain must be starter, starters enter at minute 0.
- Confirmed lineups must have exactly 11 starters and exactly one captain. After confirmation, detail changes and structural lineup changes are blocked by database triggers.

## Operational limits

- Request body limit: `256kb`.
- Pool timeout settings are configured through `.env`.
- `/health` confirms the process is alive; `/ready` checks PostgreSQL.
- Logs are structured JSON and include `requestId`. Clients may send `X-Request-Id`.

## Integration tests

`npm test` always runs unit/HTTP contract tests. PostgreSQL integration tests are skipped unless both safeguards are set:

- `SGPF_TEST_DATABASE_URL` explicitly points to a disposable database whose name ends with `_test`.
- `SGPF_TEST_ALLOW_SCHEMA_RESET=true` confirms the test may create and drop an isolated temporary schema.

The integration harness never installs into `public`: each run creates a unique `sgpf_it_*` schema, sets `search_path` to that schema, installs objects by expanding `sql/00_install_all.sql`, runs behavior/concurrency checks, and drops only that temporary schema in `finally`. Do not use shared databases.

Run `sql/06_explain.sql` to inspect representative query plans after loading sample data.
