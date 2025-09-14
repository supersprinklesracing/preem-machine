import { render, screen } from '@/test-utils';
import React from 'react';
import { UserAvatar, UserAvatarIcon } from './UserAvatar';

describe('UserAvatar', () => {
  const mockUser = {
    id: 'user-1',
    path: 'users/user-1',
    name: 'Alice',
    avatarUrl: 'https://example.com/alice.png',
  };

  it('renders a link with the user avatar and name', () => {
    render(<UserAvatar user={mockUser} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/user/user-1');
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByAltText('Alice')).toHaveAttribute(
      'src',
      'https://example.com/alice.png',
    );
  });

  it('renders without a link if user has no path', () => {
    const userWithoutPath = { ...mockUser, path: undefined };
    render(<UserAvatar user={userWithoutPath} />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders "Anonymous" if no user is provided', () => {
    render(<UserAvatar user={null} />);
    expect(screen.getByText('Anonymous')).toBeInTheDocument();
  });

  it('accepts a size prop', () => {
    render(<UserAvatar user={mockUser} size="lg" />);
    // Note: Testing the size prop's effect might require a more specific test,
    // but for now we'll just check that it doesn't break rendering.
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });
});

describe('UserAvatarIcon', () => {
  const mockUser = {
    id: 'user-1',
    path: 'users/user-1',
    name: 'Alice',
    avatarUrl: 'https://example.com/alice.png',
  };

  it('renders a link with the user avatar', () => {
    render(<UserAvatarIcon user={mockUser} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/user/user-1');
    expect(screen.getByAltText('Alice')).toBeInTheDocument();
    expect(screen.queryByText('Alice')).not.toBeInTheDocument();
  });

  it('renders without a link if user has no path', () => {
    const userWithoutPath = { ...mockUser, path: undefined };
    render(<UserAvatarIcon user={userWithoutPath} />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders "Anonymous" avatar if no user is provided', () => {
    render(<UserAvatarIcon user={null} />);
    expect(screen.getByTitle('Anonymous')).toBeInTheDocument();
  });

  it('accepts a size prop', () => {
    render(<UserAvatarIcon user={mockUser} size="lg" />);
    expect(screen.getByAltText('Alice')).toBeInTheDocument();
  });
});
