import { render, screen } from '@/test-utils';
import React from 'react';
import AvatarCluster from './AvatarCluster';
import '../../matchMedia.mock';

describe('AvatarCluster', () => {
  it('should render the user avatar when a user is logged in', () => {
    const mockUser = {
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
      photoURL: 'https://example.com/avatar.png',
    };

    render(<AvatarCluster />, { authUser: mockUser });

    const avatarLink = screen.getByRole('link');
    expect(avatarLink).toBeInTheDocument();
    expect(avatarLink).toHaveAttribute('href', '/account');

    const avatarImg = screen.getByAltText('Test User');
    expect(avatarImg).toBeInTheDocument();
    expect(avatarImg).toHaveAttribute('src', 'https://example.com/avatar.png');
  });

  it('should not render an avatar when no user is logged in', () => {
    render(<AvatarCluster />, { authUser: null });
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
