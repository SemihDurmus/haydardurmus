-- ============================================================
-- 001_bilingual_columns.sql
--
-- Adds the Turkish sibling for every column holding text we author, so the
-- site's two languages both come out of the database instead of Turkish
-- living in a hardcoded frontend file.
--
-- Columns added (8 tables, 8 columns):
--   nationality.name_tr           technique.name_tr        material.name_tr
--   country.name_tr               city.name_tr
--   artist.description_tr         owner.description_tr
--   painting.painting_description_tr
--
-- Deliberately NOT added: artist/owner first_name + last_name, painting_no,
-- painting_name, currency name + symbol, and anything on contact_message.
-- The first four are proper names and codes -- a painting's title is no more
-- translatable than the artist's name; 'Kurban' is 'Kurban' in any language.
-- contact_message is excluded for a different reason: a visitor wrote it.
--
-- Three phases, because the mandatory columns land on tables that already
-- hold rows and Postgres will not accept a bare NOT NULL there:
--   1. ADD COLUMN, nullable
--   2. backfill
--   3. tighten to NOT NULL + UNIQUE, and add the CHECK constraints
--
-- Safe to re-run: every step is IF NOT EXISTS / idempotent, and the whole
-- file is one transaction, so a failure anywhere leaves the database exactly
-- as it was.
--
-- Run it with:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f migrations/001_bilingual_columns.sql
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- Phase 1: add the columns, all nullable for now.
-- ------------------------------------------------------------

ALTER TABLE nationality ADD COLUMN IF NOT EXISTS name_tr VARCHAR(100);
ALTER TABLE technique   ADD COLUMN IF NOT EXISTS name_tr VARCHAR(100);
ALTER TABLE material    ADD COLUMN IF NOT EXISTS name_tr VARCHAR(100);
ALTER TABLE country     ADD COLUMN IF NOT EXISTS name_tr VARCHAR(100);
ALTER TABLE city        ADD COLUMN IF NOT EXISTS name_tr VARCHAR(100);

ALTER TABLE artist   ADD COLUMN IF NOT EXISTS description_tr TEXT;
ALTER TABLE owner    ADD COLUMN IF NOT EXISTS description_tr TEXT;

ALTER TABLE painting ADD COLUMN IF NOT EXISTS painting_description_tr TEXT;

-- ------------------------------------------------------------
-- Phase 2: backfill.
--
-- The translations below are lifted from the frontend's curated lookup table
-- (frontend/src/domains/paintings/data/lookups.ts), which is the file this
-- whole migration exists to retire. Anything not in that list falls back to
-- the English value -- a visible, correctable placeholder rather than a
-- guess. Only rows still NULL are touched, so re-running never overwrites a
-- translation an admin has since corrected.
-- ------------------------------------------------------------

UPDATE technique SET name_tr = v.tr
FROM (VALUES
    ('Oil',         'Yağlıboya'),
    ('Acrylic',     'Akrilik'),
    ('Watercolor',  'Suluboya'),
    ('Mixed Media', 'Karma Teknik'),
    ('Pastel',      'Pastel'),
    ('Charcoal',    'Karakalem'),
    ('Collage',     'Kolaj')
) AS v(en, tr)
WHERE technique.name = v.en AND technique.name_tr IS NULL;

UPDATE material SET name_tr = v.tr
FROM (VALUES
    ('Canvas',         'Tuval'),
    ('Canvas Panel',   'Pres Tuval'),
    ('Paper',          'Kağıt'),
    ('Wood Panel',     'Ahşap Panel'),
    ('Plywood',        'Kontrplak'),
    ('Cardboard',      'Karton'),
    ('PVC Foam Board', 'Duralit')
) AS v(en, tr)
WHERE material.name = v.en AND material.name_tr IS NULL;

UPDATE nationality SET name_tr = v.tr
FROM (VALUES
    ('Turkish', 'Türk'),
    ('French',  'Fransız'),
    ('Spanish', 'İspanyol'),
    ('English', 'İngiliz'),
    ('German',  'Alman'),
    ('Italian', 'İtalyan'),
    ('Greek',   'Yunan'),
    ('Dutch',   'Hollandalı'),
    ('American','Amerikalı')
) AS v(en, tr)
WHERE nationality.name = v.en AND nationality.name_tr IS NULL;

UPDATE country SET name_tr = v.tr
FROM (VALUES
    ('Türkiye',        'Türkiye'),
    ('Turkey',         'Türkiye'),
    ('Cyprus',         'Kıbrıs'),
    ('Spain',          'İspanya'),
    ('France',         'Fransa'),
    ('Germany',        'Almanya'),
    ('Italy',          'İtalya'),
    ('Greece',         'Yunanistan'),
    ('Netherlands',    'Hollanda'),
    ('United Kingdom', 'Birleşik Krallık'),
    ('United States',  'Amerika Birleşik Devletleri')
) AS v(en, tr)
WHERE country.name = v.en AND country.name_tr IS NULL;

UPDATE city SET name_tr = v.tr
FROM (VALUES
    ('Istanbul', 'İstanbul'),
    ('Izmir',    'İzmir'),
    ('Ankara',   'Ankara'),
    ('London',   'Londra'),
    ('Paris',    'Paris'),
    ('Berlin',   'Berlin'),
    ('Athens',   'Atina'),
    ('New York', 'New York')
) AS v(en, tr)
WHERE city.name = v.en AND city.name_tr IS NULL;

-- Fallback for every lookup row the lists above didn't cover: copy the
-- English value across so the NOT NULL in phase 3 can be applied. These are
-- the rows an admin needs to revisit -- the verification query at the bottom
-- of this file lists them.
UPDATE nationality SET name_tr = name WHERE name_tr IS NULL;
UPDATE technique   SET name_tr = name WHERE name_tr IS NULL;
UPDATE material    SET name_tr = name WHERE name_tr IS NULL;
UPDATE country     SET name_tr = name WHERE name_tr IS NULL;
UPDATE city        SET name_tr = name WHERE name_tr IS NULL;

-- Descriptions are left alone on purpose. Every one of them is currently
-- NULL in both languages, which satisfies the both-or-neither CHECK below.
-- Where an English description does exist, it is mirrored so the constraint
-- holds; the admin then replaces the placeholder with a real translation.
UPDATE artist   SET description_tr = description
    WHERE description IS NOT NULL AND description_tr IS NULL;
UPDATE owner    SET description_tr = description
    WHERE description IS NOT NULL AND description_tr IS NULL;
UPDATE painting SET painting_description_tr = painting_description
    WHERE painting_description IS NOT NULL AND painting_description_tr IS NULL;

-- ------------------------------------------------------------
-- Phase 3: tighten. Mirrors the constraints on the English columns.
-- ------------------------------------------------------------

ALTER TABLE nationality ALTER COLUMN name_tr SET NOT NULL;
ALTER TABLE technique   ALTER COLUMN name_tr SET NOT NULL;
ALTER TABLE material    ALTER COLUMN name_tr SET NOT NULL;
ALTER TABLE country     ALTER COLUMN name_tr SET NOT NULL;
ALTER TABLE city        ALTER COLUMN name_tr SET NOT NULL;

-- UNIQUE where the English column is UNIQUE. Wrapped in DO blocks because
-- ADD CONSTRAINT has no IF NOT EXISTS form.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'nationality_name_tr_key') THEN
        ALTER TABLE nationality ADD CONSTRAINT nationality_name_tr_key UNIQUE (name_tr);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'technique_name_tr_key') THEN
        ALTER TABLE technique ADD CONSTRAINT technique_name_tr_key UNIQUE (name_tr);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'material_name_tr_key') THEN
        ALTER TABLE material ADD CONSTRAINT material_name_tr_key UNIQUE (name_tr);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'country_name_tr_key') THEN
        ALTER TABLE country ADD CONSTRAINT country_name_tr_key UNIQUE (name_tr);
    END IF;
    -- City repeats the composite rule: unique within a country, both languages.
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'city_name_tr_country_id_key') THEN
        ALTER TABLE city ADD CONSTRAINT city_name_tr_country_id_key UNIQUE (name_tr, country_id);
    END IF;
END $$;

-- Both-or-neither for the optional prose columns. A bare NOT NULL here would
-- demand Turkish text for records that have no English text either.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_artist_description_bilingual') THEN
        ALTER TABLE artist ADD CONSTRAINT chk_artist_description_bilingual
            CHECK ((description IS NULL) = (description_tr IS NULL));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_owner_description_bilingual') THEN
        ALTER TABLE owner ADD CONSTRAINT chk_owner_description_bilingual
            CHECK ((description IS NULL) = (description_tr IS NULL));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_painting_description_bilingual') THEN
        ALTER TABLE painting ADD CONSTRAINT chk_painting_description_bilingual
            CHECK ((painting_description IS NULL) = (painting_description_tr IS NULL));
    END IF;
END $$;

COMMIT;

-- ============================================================
-- Verification. Run this afterwards to find every row still carrying an
-- English placeholder instead of a real translation -- the admin to-do list:
--
--   SELECT 'technique' t, id, name FROM technique   WHERE name_tr = name
--   UNION ALL SELECT 'material',    id, name FROM material    WHERE name_tr = name
--   UNION ALL SELECT 'nationality', id, name FROM nationality WHERE name_tr = name
--   UNION ALL SELECT 'country',     id, name FROM country     WHERE name_tr = name
--   UNION ALL SELECT 'city',        id, name FROM city        WHERE name_tr = name
--   ORDER BY 1, 2;
-- ============================================================
