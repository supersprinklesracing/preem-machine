import { render, screen } from '@/test-utils';
import React from 'react';
import UserAvatar from './UserAvatar';
import '@/matchMedia.mock';

describe('UserAvatar component', () => {
  it('should render a link with the user avatar and name when a user with an ID is provided', () => {
    const mockUser = {
      id: 'user-1',
      name: 'Alice',
      avatarUrl: 'https://example.com/alice.png',
    };
    render(<UserAvatar user={mockUser} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/user/user-1');
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByAltText('Alice')).toHaveAttribute(
      'src',
      'https://example.com/alice.png',
    );
  });

  it('should render the user avatar and name without a link when a user without an ID is provided', () => {
    const mockUser = {
      name: 'Anonymous User',
      avatarUrl: 'https://example.com/anon.png',
    };
    render(<UserAvatar user={mockUser} />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText('Anonymous User')).toBeInTheDocument();
  });

  it('should render "Anonymous" when no user is provided', () => {
    render(<UserAvatar user={null} />);
    expect(screen.getByText('Anonymous')).toBeInTheDocument();
  });
});
