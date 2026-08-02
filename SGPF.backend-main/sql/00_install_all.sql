-- Master installation helper for psql-compatible runners.
-- pgAdmin Query Tool does not reliably execute include meta-commands in every setup.
-- Safe pgAdmin strategy: open and run 01_schema.sql through 05_seeds.sql in a single Query Tool session, in numeric order.
-- Each script is idempotent; for an all-or-nothing install in pgAdmin, paste the contents between BEGIN and COMMIT manually.
BEGIN;
\ir 01_schema.sql
\ir 02_views.sql
\ir 03_functions.sql
\ir 04_triggers.sql
\ir 05_seeds.sql
COMMIT;
