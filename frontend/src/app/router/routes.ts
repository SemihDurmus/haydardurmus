/**
 * Route config — single source of truth for all application routes.
 * Adding a new route: add an entry here and create the corresponding page.
 */
export const ROUTES = {
  HOME: '/',
  BIOGRAPHY: '/biography',
  PAINTINGS: '/paintings',
  PAINTING_DETAIL: '/paintings/:id',
  COLLECTIONS: '/collections',
  COLLECTION_DETAIL: '/collections/:id',
  MEDIA: '/media',
  BOOK: '/book',
  CONTACT: '/contact',

  // Phase 2+ — defined now to prevent route conflicts later
  LOGIN: '/login',
  ACCOUNT: '/account',
  ADMIN: '/admin',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

/** Build a dynamic route path. */
export const buildRoute = {
  paintingDetail: (id: string) => `/paintings/${id}`,
  collectionDetail: (id: string) => `/collections/${id}`,
} as const;
