import { PaintingImageGrid } from '@domains/paintings/components/PaintingImageGrid';
import { buildRoute } from '@app/router/routes';
import type { Painting } from '@domains/paintings/types';

interface FeaturedPaintingImagesProps {
  paintings: Painting[];
  isLoading: boolean;
}

// Purely presentational — the query (and its refetch, for the Refresh
// button) lives in the Home page, which also owns the row above this grid.
export function FeaturedPaintingImages({ paintings, isLoading }: FeaturedPaintingImagesProps) {
  return (
    <PaintingImageGrid
      paintings={paintings}
      isLoading={isLoading}
      linkTo={(painting) => `${buildRoute.paintingDetail(painting.id)}?from=home`}
    />
  );
}
