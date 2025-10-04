import React from 'react';

import { MOCK_USER, render, screen } from '@/test-utils';

import { UserAvatar, UserAvatarIcon } from './UserAvatar';

describe('UserAvatar', () => {
  it('renders a link with the user avatar and name', () => {
    render(<UserAvatar user={MOCK_USER} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', `/view/user/${MOCK_USER.id}`);
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByAltText('Test User')).toHaveAttribute(
      'src',
      'https://placehold.co/100x100.png',
    );
  });

  it('renders without a link if user has no path', () => {
    const userWithoutPath = { ...MOCK_USER, path: undefined };
    render(<UserAvatar user={userWithoutPath} />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders "Anonymous" if no user is provided', () => {
    render(<UserAvatar user={null} />);
    expect(screen.getByText('Anonymous')).toBeInTheDocument();
  });

  it('accepts a size prop', () => {
    render(<UserAvatar user={MOCK_USER} size="lg" />);
    // Note: Testing the size prop's effect might require a more specific test,
    // but for now we'll just check that it doesn't break rendering.
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });
});

describe('UserAvatarIcon', () => {
  it('renders a link with the user avatar', () => {
    render(<UserAvatarIcon user={MOCK_USER} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', `/view/user/${MOCK_USER.id}`);
    expect(screen.getByAltText('Test User')).toBeInTheDocument();
    expect(screen.queryByText('Test User')).not.toBeInTheDocument();
  });

  it('renders without a link if user has no path', () => {
    const userWithoutPath = { ...MOCK_USER, path: undefined };
    render(<UserAvatarIcon user={userWithoutPath} />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders "Anonymous" avatar if no user is provided', () => {
    render(<UserAvatarIcon user={null} />);
    expect(screen.getByTitle('Anonymous')).toBeInTheDocument();
  });

  it('accepts a size prop', () => {
    render(<UserAvatarIcon user={MOCK_USER} size="lg" />);
    expect(screen.getByAltText('Test User')).toBeInTheDocument();
  });
});
