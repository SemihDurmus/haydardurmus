/**
 * Router smoke test — mounts the real app router inside the full provider
 * stack to catch wiring regressions: route config, lazy route imports,
 * provider order, and react-router upgrades.
 */
import { render, screen } from '@testing-library/react';
import '@i18n/config';
import { AppProviders } from '@app/providers';
import { AppRouter } from '@app/router';

beforeAll(() => {
  // jsdom lacks these browser APIs; provide inert stand-ins.
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  window.scrollTo = vi.fn();
  // No network in tests — queries settle into their error state, which is
  // enough to prove the routes themselves mount.
  window.fetch = vi.fn(() =>
    Promise.reject(new Error('network disabled in tests')),
  ) as unknown as typeof fetch;
});

test('renders the public home route without crashing', async () => {
  render(
    <AppProviders>
      <AppRouter />
    </AppProviders>,
  );

  // The header (public layout chrome) proves the router matched and rendered.
  expect(await screen.findByAltText('Haydar Durmuş')).toBeInTheDocument();
});
