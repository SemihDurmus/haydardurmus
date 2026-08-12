import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

export const prisma = new PrismaClient({ adapter });

export default prisma;

/*Why a module-level `const` gives you a singleton for free:** Node caches modules.
The first `import` of `src/db/prisma.ts` runs the file top-to-bottom *once* — constructing the client — and caches the resulting exports.
Every later `import` from any file gets the **same cached object**, not a re-run.
So `export const prisma = new PrismaClient(...)` at module scope *is* the singleton; the constructor fires exactly once no matter how many files import it.
> One caveat for later: in dev with hot-reload (e.g. `tsx watch`), the module can be re-evaluated on every file save, quietly creating a *new* pool each reload and leaking the old ones — the slow-motion version of exhaustion.
The standard guard is to stash the client on `globalThis` so reloads reuse it. You don't need that yet (the smoke script is one-shot), but it's why production setups add the `globalThis` dance. */

/* globalThis is a standardized way to access the global object in JavaScript across different environments, such as browsers and Node.js, ensuring consistent behavior.
 It simplifies the process of referencing global variables without needing to know the specific environment. */
