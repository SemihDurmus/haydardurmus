# Haydar Durmuş — Artist Website

A production-oriented frontend for presenting the work and biography of painter **Haydar Durmuş**. The site showcases paintings, collections, press and media, a book section, and contact information, with English and Turkish support.

## About the app

Visitors can:

- Browse a **home** page with a carousel, introduction, and a shuffled grid of featured works
- Read **biography** content including solo and group exhibitions
- Explore the **paintings** gallery with search, filters (year, technique, material), sorting, and shareable URL state
- Open **painting detail** pages with metadata, image lightbox, and ImageKit-hosted artwork
- View **collections**, **media**, **book**, and **contact** sections

The codebase is structured for long-term growth: domain folders, a shared design system, UI wrappers around MUI, and mock data that can later be replaced by an API without rewriting the UI layer.

## Tech stack

| Area | Choice |
|------|--------|
| Framework | React 19, TypeScript, Vite |
| Routing | React Router 7 (lazy-loaded pages) |
| Styling | Tailwind CSS, design tokens, CVA variants |
| UI base | MUI (used via `@shared/ui` wrappers) |
| Data / state | TanStack Query; filters & sort in URL search params |
| Images | [ImageKit](https://imagekit.io) (`@imagekit/react`) |
| i18n | i18next, react-i18next (EN / TR) |
| Forms | react-hook-form, Zod |
| Tests | Jest, React Testing Library |

## Requirements

- **Node.js** 18+ (20+ recommended)
- **npm** 9+

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with hot reload |
| `npm run build` | Type-check (`tsc -b`) and production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run type-check` | Run TypeScript without emitting files |
| `npm run lint` | Run ESLint |
| `npm run format` | Format the repo with Prettier |
| `npm run test` | Run Jest unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |

## Getting started

```bash
# Install dependencies
npm install

# Start development server (default http://localhost:5173)
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## Project structure

```
src/
├── app/              # Router, layouts, providers
├── pages/            # Route-level page components
├── domains/          # Feature modules (paintings, biography, home, …)
├── shared/           # UI wrappers, hooks, utilities
├── design-system/    # Tokens, MUI theme, CVA variants
├── i18n/             # Locale JSON and i18n config
└── assets/           # Static images (carousel, biography, branding)
```

Path aliases (see `vite.config.ts`): `@app`, `@domains`, `@shared`, `@design-system`, `@i18n`, `@pages`, `@assets`.

## Paintings gallery

- Filter state is stored in the **URL** (bookmarkable and shareable)
- Lookup data for techniques and materials lives in `src/domains/paintings/data/lookups.ts`
- Mock paintings in `src/domains/paintings/data/mockPaintings.ts` until a backend API is connected

## Images

Painting photos are loaded from ImageKit (`https://ik.imagekit.io/haydardurmus`), using filenames like `/{paintingNo}.jpg`. Carousel and branding assets are bundled from `src/assets/`.

## Internationalization

- Locales: **English** (`en`), **Turkish** (`tr`)
- Translation files: `src/i18n/locales/{en,tr}/*.json`
- Language preference is persisted in `localStorage` (`haydardurmus_lang`)
- Document `lang` is synced for correct Turkish uppercase rules (e.g. `i` → `İ`)

## License

Private project — all rights reserved unless stated otherwise by the repository owner.
