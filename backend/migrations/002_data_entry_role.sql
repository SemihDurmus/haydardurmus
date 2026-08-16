-- ============================================================
-- 002_data_entry_role.sql
--
-- The `data_entry` group role: full CRUD on the data, nothing else.
--
-- This exists so colleagues can work in the live database with `psql` without
-- being given either of the two credentials that would otherwise be shared:
--
--   * The Railway account — which is billing, the ability to delete the
--     database and the images volume, and every environment variable,
--     including JWT_SECRET and ADMIN_PASSWORD in plaintext. Handing that over
--     hands over the admin panel and the ability to mint API tokens.
--   * The `postgres` role — the server's only other role, and a superuser.
--
-- Nobody needs a Railway login to reach the database: the TCP proxy is
-- publicly reachable, so a host, port, username and password are enough.
--
-- WHAT THIS DELIBERATELY DOES NOT GRANT, and why no extra work is needed:
--
--   * Roles. A role with neither SUPERUSER nor CREATEROLE cannot create,
--     alter, drop, or read the password hash of any role. Simply never grant
--     CREATEROLE to these logins. (A login CAN change its own password —
--     that is normal, and is not a route to anyone else's account.)
--   * Schema/DDL. The tables are owned by `postgres`, and only an owner or a
--     superuser may DROP or ALTER a table. Members get data privileges only.
--
-- Safe to re-run: the role creation is guarded, and GRANT is idempotent.
--
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f migrations/002_data_entry_role.sql
-- ============================================================

BEGIN;

-- CREATE ROLE has no IF NOT EXISTS form.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'data_entry') THEN
        CREATE ROLE data_entry NOLOGIN;
    END IF;
END $$;

GRANT CONNECT ON DATABASE railway TO data_entry;
GRANT USAGE   ON SCHEMA public    TO data_entry;

-- Full CRUD on the data. Colleagues add records, correct them, and remove
-- mistakes; withholding DELETE would just send them back to the owner for
-- every typo.
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO data_entry;

-- Every id is GENERATED ALWAYS AS IDENTITY, which draws from a sequence.
-- Without USAGE here, INSERT fails with "permission denied for sequence".
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO data_entry;

-- The two GRANTs above apply only to objects that exist right now. These
-- defaults cover whatever a future migration adds, so a new table doesn't
-- silently lock everyone out. They apply to objects created by `postgres`,
-- which owns everything here.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO data_entry;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT USAGE, SELECT ON SEQUENCES TO data_entry;

COMMIT;

-- ============================================================
-- Adding a colleague (NOT part of this file — passwords must never be
-- committed). Generate a password with `openssl rand -base64 24`, run:
--
--     CREATE ROLE alice LOGIN PASSWORD '<generated>';
--     GRANT data_entry TO alice;
--
-- and send it out of band. They connect with:
--
--     psql "postgresql://alice:<password>@altaria.proxy.rlwy.net:21148/railway"
--
-- Removing one:
--     ALTER ROLE alice NOLOGIN;          -- suspend, keeps the role
--     REVOKE data_entry FROM alice;      -- drop privileges, keeps the login
--     DROP ROLE alice;                   -- remove entirely
--
-- The proxy is internet-facing and Railway offers no IP allowlist on it, so
-- password strength and prompt revocation are the only controls.
-- ============================================================
