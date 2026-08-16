import '@testing-library/jest-dom/vitest';

// jsdom implements no layout engine and so has no ResizeObserver. Components
// that measure themselves (PaintingImageFrame sizes its frame to the image's
// aspect ratio) construct one on mount and would throw on render. An inert
// stub is enough: the callback never needs to fire, since there is nothing to
// measure in jsdom anyway.
if (!('ResizeObserver' in globalThis)) {
  class ResizeObserverStub {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  }
  globalThis.ResizeObserver =
    ResizeObserverStub as unknown as typeof globalThis.ResizeObserver;
}
