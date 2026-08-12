-- ============================================================
-- Art Gallery Database Schema (teaching mirror)
-- PostgreSQL
--
-- The whole file runs inside ONE transaction (BEGIN ... COMMIT):
-- if any statement fails, everything rolls back, so we never end
-- up with a half-built schema.
--
-- Primary keys use GENERATED ALWAYS AS IDENTITY rather than SERIAL.
-- SERIAL is a PostgreSQL-only shorthand that creates a loosely-owned
-- sequence and leaves the column writable, so an application can insert
-- its own id and silently desynchronise the sequence -- the classic
-- "duplicate key" failure after a data import. IDENTITY is the SQL
-- standard, ties the sequence to the column, and ALWAYS rejects an
-- explicit id outright.
--
-- COPY is exempt from that restriction, so `pg_dump --data-only`
-- restores (see DEPLOYMENT.md step 3) still load their original ids.
-- ============================================================

BEGIN;

-- ============================================================
-- 1. Lookup / reference tables
--    id + UNIQUE name. The UNIQUE is what turns a duplicate
--    name into a 409 (Prisma P2002) at the API layer.
-- ============================================================

CREATE TABLE nationality (
    id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE technique (
    id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE material (
    id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE
);

-- currency is the one lookup with a variation: an extra symbol column.
CREATE TABLE currency (
    id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    symbol      VARCHAR(10)  NOT NULL
);

-- ============================================================
-- 2. Location hierarchy: country -> city
-- ============================================================

CREATE TABLE country (
    id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE city (
    id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    -- Required FK; RESTRICT means a country with cities cannot be deleted.
    country_id  INTEGER      NOT NULL REFERENCES country(id) ON DELETE RESTRICT,
    -- Composite uniqueness: a city name is unique *within* a country
    -- ("Paris, France" and "Paris, Texas" are both allowed).
    UNIQUE (name, country_id)
);

-- ============================================================
-- 3. Core tables
-- ============================================================

-- artist: required nationality FK (RESTRICT), plus updated_at (see trigger below).
CREATE TABLE artist (
    id              INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nationality_id  INTEGER      NOT NULL REFERENCES nationality(id) ON DELETE RESTRICT,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    birthdate       DATE,
    description     TEXT,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(), -- TIMESTAMPTZ is a data type used in databases to store date and time information with time zone awareness, ensuring accurate timekeeping across different regions. It stores all timestamps in UTC and converts them to the appropriate time zone when retrieved.
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()  -- TIMESTAMPTZ is a data type used in databases to store date and time information with time zone awareness, ensuring accurate timekeeping across different regions. It stores all timestamps in UTC and converts them to the appropriate time zone when retrieved.
);

-- owner: the nullable-FK case ("anonymous owner"). SET NULL means deleting a
-- referenced city/nationality nulls the column here instead of failing.
CREATE TABLE owner (
    id              INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    city_id         INTEGER      REFERENCES city(id) ON DELETE SET NULL,
    nationality_id  INTEGER      REFERENCES nationality(id) ON DELETE SET NULL,
    description     TEXT,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),  -- TIMESTAMPTZ is a data type used in databases to store date and time information with time zone awareness, ensuring accurate timekeeping across different regions. It stores all timestamps in UTC and converts them to the appropriate time zone when retrieved.
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()  -- TIMESTAMPTZ is a data type used in databases to store date and time information with time zone awareness, ensuring accurate timekeeping across different regions. It stores all timestamps in UTC and converts them to the appropriate time zone when retrieved.
);

-- painting: the centerpiece. Note the CHECK constraints, and the mix of
-- FK delete policies (artist RESTRICT = required; the rest SET NULL = optional).
CREATE TABLE painting (
    id                   INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    painting_no          VARCHAR(50)   NOT NULL UNIQUE,
    painting_name        VARCHAR(255)  NOT NULL,
    width_cm             NUMERIC(7,2),
    height_cm            NUMERIC(7,2),
    radius_cm            NUMERIC(7,2),
    painting_description  TEXT,
    artist_id            INTEGER       NOT NULL REFERENCES artist(id) ON DELETE RESTRICT,
    year                 SMALLINT,
    technique_id         INTEGER       REFERENCES technique(id) ON DELETE SET NULL,
    material_id          INTEGER       REFERENCES material(id) ON DELETE SET NULL,
    location_city_id     INTEGER       REFERENCES city(id) ON DELETE SET NULL,
    owner_id             INTEGER       REFERENCES owner(id) ON DELETE SET NULL,
    created_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    -- NOT NULL with no DB default on purpose: the API supplies the default
    -- (zod .default(true)). Mirrors the real database, where this column was
    -- added after the original schema file was written.
    is_available         BOOLEAN       NOT NULL,

    CONSTRAINT chk_year       CHECK (year BETWEEN 1000 AND 2100),
    CONSTRAINT chk_width_cm   CHECK (width_cm  > 0),
    CONSTRAINT chk_height_cm  CHECK (height_cm > 0),
    CONSTRAINT chk_radius_cm  CHECK (radius_cm > 0),
    -- The XOR dimensions rule, enforced in the DB as a last backstop:
    -- rectangular (width AND height, no radius) OR circular (radius only).
    CONSTRAINT chk_dimensions CHECK (
        (width_cm IS NOT NULL AND height_cm IS NOT NULL AND radius_cm IS NULL)
        OR (radius_cm IS NOT NULL AND width_cm IS NULL AND height_cm IS NULL)
    )
);

-- painting_image: RESTRICT on painting (can't delete a painting that has images).
-- NOTE: there is deliberately NO DB constraint enforcing "one primary per
-- painting" -- that invariant lives in the service-layer transaction (Phase 12).
CREATE TABLE painting_image (
    id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    painting_id  INTEGER      NOT NULL REFERENCES painting(id) ON DELETE RESTRICT,
    -- The painting's physical number, denormalized from painting.painting_no.
    -- These numbers are written on the back of the physical canvases, so
    -- carrying one on every image row keeps an exported/dumped painting_image
    -- table meaningful on its own, without needing to re-join painting.
    -- Never write this column directly: the triggers in section 6 fill it
    -- from the parent on insert and keep it in sync if the parent changes.
    -- The DEFAULT '' is never actually stored — it exists so inserts may omit
    -- the column (the trigger overwrites it), the same way updated_at pairs a
    -- DEFAULT with a trigger. It also keeps the field optional in Prisma.
    painting_no VARCHAR(50)  NOT NULL DEFAULT '',
    file_path   VARCHAR(500) NOT NULL,
    is_primary  BOOLEAN      NOT NULL DEFAULT FALSE,
    uploaded_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Look up / group image rows by the physical number (e.g. when reconciling
-- files against the paintings they belong to).
CREATE INDEX idx_painting_image_painting_no ON painting_image(painting_no);

-- ============================================================
-- 4. Pricing (supports history via is_current)
-- ============================================================

CREATE TABLE price (
    id             INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    painting_id     INTEGER       NOT NULL REFERENCES painting(id) ON DELETE RESTRICT,
    currency_id    INTEGER       NOT NULL REFERENCES currency(id) ON DELETE RESTRICT,
    amount         NUMERIC(14,2) NOT NULL,
    effective_date DATE          NOT NULL DEFAULT CURRENT_DATE,
    is_current     BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_amount CHECK (amount >= 0)
);

-- ============================================================
-- 5. Contact messages
-- ============================================================

CREATE TABLE contact_message (
    id           INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    first_name   VARCHAR(100) NOT NULL,
    last_name    VARCHAR(100) NOT NULL,
    email        VARCHAR(255) NOT NULL,
    message      TEXT         NOT NULL,
    painting_id   INTEGER      REFERENCES painting(id) ON DELETE SET NULL,
    -- Admin inbox read/unread flag (drives the unread badge in the admin bar).
    is_read      BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 6. Auto-update updated_at trigger
--
-- A BEFORE UPDATE trigger that stamps updated_at = NOW() on every update,
-- making the timestamp tamper-proof regardless of who issues the UPDATE.
-- Attached only to the four tables that HAVE an updated_at column.
-- (No BEFORE INSERT needed: the column's DEFAULT NOW() handles inserts.)
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_artist_updated_at
    BEFORE UPDATE ON artist
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_owner_updated_at
    BEFORE UPDATE ON owner
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_painting_updated_at
    BEFORE UPDATE ON painting
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_contact_message_updated_at
    BEFORE UPDATE ON contact_message
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ------------------------------------------------------------
-- painting_image.painting_no sync
--
-- painting_no is denormalized onto painting_image for portability (see the
-- table definition). These two triggers make it impossible for that copy to
-- drift from painting.painting_no, so no application code has to remember to
-- set it:
--   1. on INSERT (or if an image is moved to another painting) the value is
--      taken from the parent — anything the client sends is overwritten;
--   2. if a painting's number is ever corrected, the change propagates to all
--      of its image rows.
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION set_painting_image_painting_no()
RETURNS TRIGGER AS $$
BEGIN
    SELECT p.painting_no INTO NEW.painting_no
      FROM painting p WHERE p.id = NEW.painting_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_painting_image_painting_no
    BEFORE INSERT OR UPDATE OF painting_id ON painting_image
    FOR EACH ROW EXECUTE FUNCTION set_painting_image_painting_no();

CREATE OR REPLACE FUNCTION propagate_painting_no()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE painting_image SET painting_no = NEW.painting_no
     WHERE painting_id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_painting_no_propagate
    AFTER UPDATE OF painting_no ON painting
    FOR EACH ROW WHEN (OLD.painting_no IS DISTINCT FROM NEW.painting_no)
    EXECUTE FUNCTION propagate_painting_no();

COMMIT;

-- ============================================================
-- 7. Auto-deactivate old prices  -- DISABLED ON PURPOSE
--
-- This trigger would flip a painting's current price to is_current = FALSE
-- whenever a new price is inserted. We keep it commented out: that logic
-- moves into the SERVICE layer (Phase 13) so it is explicit and testable,
-- rather than hidden inside the database.
-- ============================================================

/* CREATE OR REPLACE FUNCTION deactivate_old_prices()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE price
    SET is_current = FALSE
    WHERE painting_id = NEW.painting_id
      AND is_current = TRUE;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_deactivate_old_prices
    BEFORE INSERT ON price
    FOR EACH ROW EXECUTE FUNCTION deactivate_old_prices();

COMMIT; */
