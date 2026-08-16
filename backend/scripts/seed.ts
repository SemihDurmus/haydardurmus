import { prisma } from "../src/db/prisma";

/**
 * Seed the database with the gallery's sample paintings.
 *
 * These 12 works (the painter Haydar Durmuş) used to live in the frontend as a
 * hard-coded `mockPaintings` array. Now the frontend fetches them from this API,
 * so the data has to actually exist in Postgres — that's what this script loads.
 *
 * It is **idempotent**: every row is matched on a natural key (unique name, or a
 * painting's unique paintingNo) and upserted, so running it twice changes nothing.
 *
 * Most paintings have no title. The DB column painting_name is NOT NULL, so we
 * store the sentinel below and the frontend maps it back to `null` for display.
 */
const UNTITLED = "Untitled";

// Lookup label maps mirror the frontend's curated bilingual lookups
// (src/domains/paintings/data/lookups.ts). The frontend keeps the EN/TR labels;
// here we only need the English name the DB stores, keyed by the frontend's id.
// Both languages: name_tr is NOT NULL, since the site renders lookups in
// Turkish straight from the database.
const TECHNIQUE_NAME: Record<string, { name: string; nameTr: string }> = {
  oil: { name: "Oil", nameTr: "Yağlıboya" },
  acrylic: { name: "Acrylic", nameTr: "Akrilik" },
  collage: { name: "Collage", nameTr: "Kolaj" },
};
const MATERIAL_NAME: Record<string, { name: string; nameTr: string }> = {
  canvas: { name: "Canvas", nameTr: "Tuval" },
  canvasPanel: { name: "Canvas Panel", nameTr: "Pres Tuval" },
  cardboard: { name: "Cardboard", nameTr: "Karton" },
  plywood: { name: "Plywood", nameTr: "Kontrplak" },
  pvcFoamBoard: { name: "PVC Foam Board", nameTr: "Duralit" },
};

// The mock paintings, verbatim from the frontend (string ids resolve to rows below).
const PAINTINGS = [
  { paintingNo: "2153", width: 31.5, height: 47, radius: null, year: 2015, technique: "oil", material: "pvcFoamBoard" },
  { paintingNo: "2314", width: 110, height: 145, radius: null, year: 2016, technique: "oil", material: "canvas" },
  { paintingNo: "2315", width: 85, height: 102, radius: null, year: 2017, technique: "oil", material: "canvas" },
  { paintingNo: "2418", width: 70, height: 50, radius: null, year: 2011, technique: "oil", material: "canvas" },
  { paintingNo: "2638", width: 50, height: 69, radius: null, year: 2018, technique: "oil", material: "canvas" },
  { paintingNo: "2647", width: 53, height: 74, radius: null, year: 2018, technique: "oil", material: "canvas" },
  { paintingNo: "2183", width: 30, height: 47, radius: null, year: 2017, technique: "collage", material: "cardboard" },
  { paintingNo: "2399", width: 50, height: 50, radius: null, year: 2011, technique: "oil", material: "canvas" },
  { paintingNo: "1911", width: null, height: null, radius: 39, year: 2014, technique: "oil", material: "plywood" },
  { paintingNo: "553", width: 21.5, height: 31, radius: null, year: 2010, technique: "acrylic", material: "canvasPanel" },
  { paintingNo: "550", width: 27, height: 24.5, radius: null, year: 2010, technique: "acrylic", material: "canvasPanel" },
  { paintingNo: "2206", width: 34, height: 45, radius: null, year: 2017, technique: "collage", material: "cardboard" },
] as const;

async function main() {
  // --- Lookups -------------------------------------------------------------
  // upsert = insert if the unique key is new, otherwise leave it as-is. The
  // `update: {}` is empty on purpose: we only want existence, not overwrites.
  const nationality = await prisma.nationality.upsert({
    where: { name: "Turkish" },
    create: { name: "Turkish", nameTr: "Türk" },
    update: {},
  });

  const country = await prisma.country.upsert({
    where: { name: "Türkiye" },
    create: { name: "Türkiye", nameTr: "Türkiye" },
    update: {},
  });

  // City is unique on (name, countryId) — no single-column unique to upsert on,
  // so find-or-create by hand.
  const trabzon =
    (await prisma.city.findFirst({
      where: { name: "Trabzon", countryId: country.id },
    })) ??
    (await prisma.city.create({
      data: { name: "Trabzon", nameTr: "Trabzon", countryId: country.id },
    }));

  const techniqueId: Record<string, number> = {};
  for (const [key, { name, nameTr }] of Object.entries(TECHNIQUE_NAME)) {
    const row = await prisma.technique.upsert({
      where: { name },
      create: { name, nameTr },
      update: {},
    });
    techniqueId[key] = row.id;
  }

  const materialId: Record<string, number> = {};
  for (const [key, { name, nameTr }] of Object.entries(MATERIAL_NAME)) {
    const row = await prisma.material.upsert({
      where: { name },
      create: { name, nameTr },
      update: {},
    });
    materialId[key] = row.id;
  }

  // Artist and owner have no unique name constraint → find-or-create.
  const artist =
    (await prisma.artist.findFirst({
      where: { firstName: "Haydar", lastName: "Durmuş" },
    })) ??
    (await prisma.artist.create({
      data: {
        firstName: "Haydar",
        lastName: "Durmuş",
        nationalityId: nationality.id,
      },
    }));

  const owner =
    (await prisma.owner.findFirst({
      where: { firstName: "Haydar", lastName: "Durmuş" },
    })) ??
    (await prisma.owner.create({
      data: {
        firstName: "Haydar",
        lastName: "Durmuş",
        nationalityId: nationality.id,
        cityId: trabzon.id,
      },
    }));

  // --- Paintings -----------------------------------------------------------
  // paintingNo is UNIQUE, so it's the natural upsert key. Re-running re-points
  // the FKs (in case a lookup id changed) without creating duplicates.
  for (const p of PAINTINGS) {
    const data = {
      paintingName: UNTITLED,
      widthCm: p.width,
      heightCm: p.height,
      radiusCm: p.radius,
      year: p.year,
      isAvailable: true,
      artistId: artist.id,
      ownerId: owner.id,
      locationCityId: trabzon.id,
      techniqueId: techniqueId[p.technique],
      materialId: materialId[p.material],
    };
    await prisma.painting.upsert({
      where: { paintingNo: p.paintingNo },
      create: { paintingNo: p.paintingNo, ...data },
      update: data,
    });
  }

  const total = await prisma.painting.count();
  // eslint-disable-next-line no-console
  console.log(`Seed complete. Paintings in DB: ${total}.`);
}

main()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error("Seed FAILED:", (err as Error).message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
