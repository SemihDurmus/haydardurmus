import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { PublicLayout } from '@app/layouts/PublicLayout';
import { AdminLayout } from '@app/layouts/AdminLayout';
import { ProtectedRoute } from '@domains/auth/components/ProtectedRoute';
import { ROUTES } from './routes';

// Route-level code splitting — each page is its own chunk
const HomePage = lazy(() => import('@pages/Home'));
const BiographyPage = lazy(() => import('@pages/Biography'));
const PaintingsPage = lazy(() => import('@pages/Paintings'));
const PaintingDetailPage = lazy(() => import('@pages/PaintingDetail'));
const CollectionPage = lazy(() => import('@pages/Collection'));
const CollectionDetailPage = lazy(() => import('@pages/CollectionDetail'));
const MediaPage = lazy(() => import('@pages/Media'));
const BookPage = lazy(() => import('@pages/Book'));
const ContactPage = lazy(() => import('@pages/Contact'));
const NotFoundPage = lazy(() => import('@pages/NotFound'));

// Admin area (auth-gated)
const AdminLoginPage = lazy(() => import('@pages/admin/Login'));
const AdminPaintingsPage = lazy(() => import('@pages/admin/Paintings'));
const AdminPaintingFormPage = lazy(() => import('@pages/admin/PaintingForm'));
const AdminLibraryPage = lazy(() => import('@pages/admin/Library'));
const AdminMessagesPage = lazy(() => import('@pages/admin/Messages'));

// Full-page loading fallback
function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-200 border-t-primary-900" />
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageLoader />}>
            <HomePage />
          </Suspense>
        ),
      },
      {
        path: ROUTES.BIOGRAPHY,
        element: (
          <Suspense fallback={<PageLoader />}>
            <BiographyPage />
          </Suspense>
        ),
      },
      {
        path: ROUTES.PAINTINGS,
        element: (
          <Suspense fallback={<PageLoader />}>
            <PaintingsPage />
          </Suspense>
        ),
      },
      {
        path: ROUTES.PAINTING_DETAIL,
        element: (
          <Suspense fallback={<PageLoader />}>
            <PaintingDetailPage />
          </Suspense>
        ),
      },
      {
        path: ROUTES.COLLECTIONS,
        element: (
          <Suspense fallback={<PageLoader />}>
            <CollectionPage />
          </Suspense>
        ),
      },
      {
        path: ROUTES.COLLECTION_DETAIL,
        element: (
          <Suspense fallback={<PageLoader />}>
            <CollectionDetailPage />
          </Suspense>
        ),
      },
      {
        path: ROUTES.MEDIA,
        element: (
          <Suspense fallback={<PageLoader />}>
            <MediaPage />
          </Suspense>
        ),
      },
      {
        path: ROUTES.BOOK,
        element: (
          <Suspense fallback={<PageLoader />}>
            <BookPage />
          </Suspense>
        ),
      },
      {
        path: ROUTES.CONTACT,
        element: (
          <Suspense fallback={<PageLoader />}>
            <ContactPage />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: '/admin/login',
    element: (
      <Suspense fallback={<PageLoader />}>
        <AdminLoginPage />
      </Suspense>
    ),
  },
  {
    // Auth gate → admin chrome → routed admin pages.
    path: '/admin',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<PageLoader />}>
                <AdminPaintingsPage />
              </Suspense>
            ),
          },
          {
            path: 'library',
            element: (
              <Suspense fallback={<PageLoader />}>
                <AdminLibraryPage />
              </Suspense>
            ),
          },
          {
            path: 'messages',
            element: (
              <Suspense fallback={<PageLoader />}>
                <AdminMessagesPage />
              </Suspense>
            ),
          },
          {
            path: 'paintings/new',
            element: (
              <Suspense fallback={<PageLoader />}>
                <AdminPaintingFormPage />
              </Suspense>
            ),
          },
          {
            path: 'paintings/:id/edit',
            element: (
              <Suspense fallback={<PageLoader />}>
                <AdminPaintingFormPage />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: (
      <Suspense fallback={<PageLoader />}>
        <NotFoundPage />
      </Suspense>
    ),
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
