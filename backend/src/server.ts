import "dotenv/config";
import app from "./app";
import { prisma } from "./db/prisma";

// Read PORT from the environment; fall back to 3000 if unset or unparseable.
// parseInt("", 10) is NaN, and NaN || 3000 === 3000 — so a missing PORT works.
const PORT = parseInt(process.env.PORT ?? "", 10) || 3000;

const server = app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${PORT}`);
});

// Graceful shutdown: stop accepting new connections, let in-flight requests
// finish (server.close), then release the database pool before exiting. Without
// this the process dies abruptly and Postgres connections leak on each restart.
async function shutdown(signal: NodeJS.Signals) {
  // eslint-disable-next-line no-console
  console.log(`\nReceived ${signal}, shutting down...`);
  server.close(async () => {
    await prisma.$disconnect().catch(() => {});
    process.exit(0);
  });
}

// void: we intentionally don't await the returned promise here — the signal
// handler is fire-and-forget, and shutdown() ends the process itself.
process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
