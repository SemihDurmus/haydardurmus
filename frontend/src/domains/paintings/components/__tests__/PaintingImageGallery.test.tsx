/**
 * The painting page shows every image of a work, not just the primary one.
 * These cover the parts that regress quietly: arrows appearing only when
 * there's more than one image, wrap-around at the ends, and the thumbnails
 * driving the main frame.
 */
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ImageAsset } from '@shared/types';
import { PaintingImageGallery } from '../PaintingImageGallery';

const IMAGES: ImageAsset[] = [
  { src: '/images/paintings/8597/one.jpg', alt: 'one' },
  { src: '/images/paintings/8597/two.jpg', alt: 'two' },
  { src: '/images/paintings/8597/three.jpg', alt: 'three' },
];

/** Wrapper owning the index, the way PaintingDetail does. */
function Harness({ images = IMAGES }: { images?: ImageAsset[] }) {
  const [index, setIndex] = useState(0);
  return (
    <PaintingImageGallery
      images={images}
      activeIndex={index}
      onActiveIndexChange={setIndex}
      alt="Kurban"
      title="Kurban"
      previousLabel="Previous image"
      nextLabel="Next image"
      thumbnailLabel={(n) => `Show image ${n}`}
    />
  );
}

/** The large frame's image — the thumbnails render with an empty alt. */
const mainImage = () => screen.getByAltText('one') ?? null;

describe('PaintingImageGallery', () => {
  it('shows arrows and a thumbnail per image when there are several', () => {
    render(<Harness />);
    expect(screen.getByLabelText('Previous image')).toBeInTheDocument();
    expect(screen.getByLabelText('Next image')).toBeInTheDocument();
    expect(screen.getByLabelText('Show image 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Show image 3')).toBeInTheDocument();
  });

  it('hides the arrows and the strip for a single image', () => {
    render(<Harness images={[IMAGES[0]]} />);
    expect(screen.queryByLabelText('Previous image')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Next image')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Show image 1')).not.toBeInTheDocument();
  });

  it('renders nothing broken for a painting with no images', () => {
    render(<Harness images={[]} />);
    expect(screen.queryByLabelText('Next image')).not.toBeInTheDocument();
  });

  it('advances to the next image', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    expect(mainImage()).toBeInTheDocument();

    await user.click(screen.getByLabelText('Next image'));
    expect(screen.getByAltText('two')).toBeInTheDocument();
  });

  it('wraps around in both directions', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    // Backwards from the first image lands on the last.
    await user.click(screen.getByLabelText('Previous image'));
    expect(screen.getByAltText('three')).toBeInTheDocument();

    // Forwards from the last returns to the first.
    await user.click(screen.getByLabelText('Next image'));
    expect(screen.getByAltText('one')).toBeInTheDocument();
  });

  it('jumps straight to an image when its thumbnail is clicked', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByLabelText('Show image 3'));
    expect(screen.getByAltText('three')).toBeInTheDocument();
    expect(screen.getByLabelText('Show image 3')).toHaveAttribute('aria-current', 'true');
  });

  it('steps through images with the arrow keys', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.keyboard('{ArrowRight}');
    expect(screen.getByAltText('two')).toBeInTheDocument();

    await user.keyboard('{ArrowLeft}');
    expect(screen.getByAltText('one')).toBeInTheDocument();
  });
});
