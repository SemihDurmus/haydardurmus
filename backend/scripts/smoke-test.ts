import { prisma } from "../src/db/prisma";

async function main() {
  // you can't `await` at the top level of a CommonJS-compiled module. `main` is just a conventional name for "the entry point."
  try {
    const counts = {
      // For each of the 12 models, call `.count()` — which the Client compiles to `SELECT COUNT(*) FROM "<table>"`.
      artists: await prisma.artist.count(),
      paintings: await prisma.painting.count(),
      owners: await prisma.owner.count(),
      countries: await prisma.country.count(),
      cities: await prisma.city.count(),
      nationalities: await prisma.nationality.count(),
      techniques: await prisma.technique.count(),
      materials: await prisma.material.count(),
      currencies: await prisma.currency.count(),
      prices: await prisma.price.count(),
      paintingImages: await prisma.paintingImage.count(),
      contactMessages: await prisma.contactMessage.count(),
    };
    // eslint-disable-next-line no-console
    console.log("Connection OK. Row counts:");
    // eslint-disable-next-line no-console
    console.table(counts);
  } catch (err) {
    // err` is typed `unknown` in modern TS, so `as Error` narrows it to read `.message`
    // eslint-disable-next-line no-console
    console.error("Connection FAILED:", (err as Error).message);
    process.exitCode = 1; //  this is the important bit: it marks the script as failed so CI / your shell / `&&` chains know it broke, *without* killing the process immediately. Contrast with `process.exit(1)`, which would abort instantly and skip the `finally` cleanup below
  } finally {
    await prisma.$disconnect(); // prisma.$disconnect()` closes the connection pool — drains and shuts the open sockets to Postgres. Without it, the pool keeps live connections open and **the Node process hangs forever** instead of exiting (those sockets are active handles keeping the event loop alive).
    // For a long - lived server you'd *keep* the pool open; for a one-shot script you must close it. Putting it in `finally` guarantees cleanup on both paths
  }
}

void main(); //  `main()` returns a `Promise`; the **`void`** operator explicitly says "I'm intentionally not awaiting this" — it satisfies the lint rule (`no-floating-promises`) that would otherwise warn about a dangling promise.
