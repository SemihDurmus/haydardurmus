import { Image } from '@imagekit/react';
import { mockPaintings } from '@domains/paintings/data/mockPaintings';

const IMAGEKIT_URL_ENDPOINT = 'https://ik.imagekit.io/haydardurmus';
const featuredPaintings = mockPaintings
  .filter((painting) => painting.isFeatured === true)
  .sort(() => Math.random() - 0.5)
  .slice(0, 12);

export function FeaturedPaintingImages() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
      {featuredPaintings.map((painting) => (
        <div key={painting.id} className="group relative aspect-[3/4] overflow-hidden bg-muted">
          <Image
            urlEndpoint={IMAGEKIT_URL_ENDPOINT}
            src={`/${painting.paintingNo}.jpg`}
            width={500}
            height={667}
            alt={painting.paintingNo || 'Painting'}
            title={painting.paintingNo || 'Painting'}
            className="h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-primary-950/70 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span className="font-heading text-[26px] text-white">{painting.paintingNo}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
