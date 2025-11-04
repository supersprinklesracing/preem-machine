import { render, screen } from '@testing-library/react';
import { FavoritesCarousel } from './FavoritesCarousel';
import { MantineProvider } from '@mantine/core';

const intersectionObserverMock = () => ({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
window.IntersectionObserver = jest
  .fn()
  .mockImplementation(intersectionObserverMock);

describe('FavoritesCarousel', () => {
  const favorites = [
    { id: 'test-doc-1', path: 'organizations/test-doc-1' },
    { id: 'test-doc-2', path: 'races/test-doc-2' },
  ];

  it('renders nothing when there are no favorites', () => {
    render(
      <MantineProvider>
        <FavoritesCarousel favorites={[]} />
      </MantineProvider>,
    );
    expect(screen.queryByText('Favorites')).not.toBeInTheDocument();
  });

  it('renders the carousel when there are favorites', () => {
    render(
      <MantineProvider>
        <FavoritesCarousel favorites={favorites} />
      </MantineProvider>,
    );
    expect(screen.getByText('Favorites')).toBeInTheDocument();
    expect(screen.getByText('organizations')).toBeInTheDocument();
    expect(screen.getByText('test-doc-1')).toBeInTheDocument();
    expect(screen.getByText('races')).toBeInTheDocument();
    expect(screen.getByText('test-doc-2')).toBeInTheDocument();
  });
});
