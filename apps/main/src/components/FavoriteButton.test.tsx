import { MantineProvider } from '@mantine/core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FavoriteButton } from './FavoriteButton';
import * as favorites from '@/datastore/server/update/favorites';

jest.mock('@/datastore/server/update/favorites', () => ({
  addFavorite: jest.fn().mockResolvedValue(undefined),
  removeFavorite: jest.fn().mockResolvedValue(undefined),
}));

describe('FavoriteButton', () => {
  jest.useRealTimers();
  const docRef = { id: 'test-doc', path: 'organizations/test-doc' };
  const user = {
    id: 'test-user',
    path: 'users/test-user',
    favoriteRefs: [],
  };

  it('renders the button in the default state', () => {
    render(
      <MantineProvider>
        <FavoriteButton docRef={docRef} user={user} />
      </MantineProvider>,
    );
    expect(screen.getByText('Favorite')).toBeInTheDocument();
  });

  it('renders the button in the favorited state', () => {
    const favoritedUser = {
      ...user,
      favoriteRefs: [docRef],
    };
    render(
      <MantineProvider>
        <FavoriteButton docRef={docRef} user={favoritedUser} />
      </MantineProvider>,
    );
    expect(screen.getByText('Favorited')).toBeInTheDocument();
  });

  it('calls addFavorite when the button is clicked', async () => {
    render(
      <MantineProvider>
        <FavoriteButton docRef={docRef} user={user} />
      </MantineProvider>,
    );
    await userEvent.click(screen.getByText('Favorite'));
    expect(favorites.addFavorite).toHaveBeenCalledWith(docRef);
  });

  it('calls removeFavorite when the button is clicked', async () => {
    const favoritedUser = {
      ...user,
      favoriteRefs: [docRef],
    };
    render(
      <MantineProvider>
        <FavoriteButton docRef={docRef} user={favoritedUser} />
      </MantineProvider>,
    );
    await userEvent.click(screen.getByText('Favorited'));
    expect(favorites.removeFavorite).toHaveBeenCalledWith(docRef);
  });
});
