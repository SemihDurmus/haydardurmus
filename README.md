# Art Gallery

Full-stack art gallery site: Express/Prisma backend + React/Vite frontend, backed by PostgreSQL.

## Structure

```
backend/    Express API (TypeScript), Prisma ORM, PostgreSQL
frontend/   React + Vite + Tailwind SPA
```

- `backend/src` — app entry (`server.ts`, `app.ts`), `routes` → `controllers` → `services` → Prisma, plus `middleware`, `openapi` (auto-generated API docs), `db/prisma.ts` (Prisma client singleton).
- `backend/prisma/schema.prisma` — source of truth for the DB schema. `backend/migrations` holds SQL migration history. `backend/art_gallery_schema.sql` is a plain-SQL snapshot of the schema.
- `backend/scripts` — one-off/maintenance scripts (`seed.ts`, `migrate-image-folders.ts`, `smoke-test.ts`), run with `tsx`.
- `frontend/src` — the React app (Vite, Tailwind, Vitest for tests).

## Prerequisites

- Node.js >= 22
- A running PostgreSQL instance

## Setup

```bash
npm run install:all        # installs backend + frontend deps
```

Copy the env templates and fill in real values:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Key backend vars: `DATABASE_URL`, `PORT`, `ADMIN_USERNAME`/`ADMIN_PASSWORD`/`JWT_SECRET` (admin panel auth). See `backend/.env.example` for deployment-only vars (`CORS_ORIGIN`, `ENABLE_DOCS`, `UPLOADS_ROOT`).

Key frontend var: `VITE_API_URL` — points at the backend API; Vite inlines it at build time.

## Running locally

```bash
npm run dev            # backend + frontend together
npm run dev:backend    # backend only (tsx watch, http://localhost:3000)
npm run dev:frontend   # frontend only (vite, http://localhost:5173)
```

## Database (Prisma)

Run from `backend/`, or via `npm --prefix backend run <script>` from the repo root.

- `npm run prisma:migrate` — create/apply a migration (`prisma migrate dev`)
- `npm run prisma:generate` — regenerate the Prisma Client after schema changes (also runs automatically on `npm install` via `postinstall`)
- `npm run prisma:studio` — open Prisma Studio (DB GUI)
- `npm run prisma:pull` — introspect the DB into `schema.prisma`
- `npm run seed` — seed the database (`backend/scripts/seed.ts`)

## Build & other checks

```bash
npm run build           # builds backend (tsc) then frontend (vite build)
```

Backend: `npm --prefix backend run typecheck`, `npm --prefix backend run smoke`.
Frontend: `npm --prefix frontend run lint`, `type-check`, `test`, `format`.

## Paintings document list
"Liste_2026.08.21_web_sitesi_için" is the current master document for the paintings list which is stored in the google drive.
It contains numbers from 1 to 2650.
There are many skipped numbers having no information in the row (marked with green). 
Also, some numbers even do not exist in that excel list:
2512-2630, and 2632, 2634, 2636, 2641, 2643, 2644, 2646 to your active missing inventory list.

## Deployment

Both `backend/` and `frontend/` have `railway.json` (Railway). The frontend also has `vercel.json` and a `Caddyfile`. Production env vars are set on the host, not committed — see the "Deployment only" section of `backend/.env.example`.

## Version History

Backend and frontend are versioned together (`backend/package.json`, `frontend/package.json`).

### 0.2.0

Collection & discovery features, plus general filtering and loading-state polish:

- Collection page: an **Artists** tab (search + sort, browse by artist) and a **Gallery** tab (every collection painting in one grid)
- Prev/next navigation between artists directly from a painting's detail page
- Painting search now matches the catalogue number (it only matched the title before, which never worked — every painting is titled "Untitled")
- Year filter changed from one chip per year to a min/max range, and no longer drops paintings with no recorded year
- Public paintings gallery scoped to the gallery's own artist by default; other artists' work lives under Collection instead
- Home page's "Selected Works" now shows a genuinely random set of paintings on every load (with a manual Refresh button), and skips paintings that have no photo
- Loading skeletons for the paintings grid, the artists list, and the painting detail page
- A proper sized placeholder (instead of a cramped one-line box) for paintings with no photo
- Media page marked as under construction, replacing the old mock press-clippings placeholder

### 0.1.x

Initial public gallery: paintings list with pagination and filters, painting detail pages, Collection/Biography/Media/Book/Contact pages, and an admin panel for managing paintings.
