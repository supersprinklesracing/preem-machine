import { User } from '@/datastore/schema';
import { render, screen } from '@/test-utils';
import AvatarCluster from './AvatarCluster';

describe('AvatarCluster', () => {
  it('should render the user avatar when a user is logged in', () => {
    const user: User = {
      id: 'test-uid',
      path: 'users/test-uid',
      email: 'test@example.com',
      name: 'Test User',
      avatarUrl: 'https://example.com/avatar.png',
    };

    render(<AvatarCluster />, { userContext: { authUser: null, user } });

    const avatarLink = screen.getByRole('link');
    expect(avatarLink).toBeInTheDocument();
    expect(avatarLink).toHaveAttribute('href', '/user/test-uid');

    const avatarImg = screen.getByAltText('Test User');
    expect(avatarImg).toBeInTheDocument();
    expect(avatarImg).toHaveAttribute('src', 'https://example.com/avatar.png');
  });

  it('should not render an avatar when no user is logged in', () => {
    render(<AvatarCluster />, { userContext: { authUser: null, user: null } });
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
