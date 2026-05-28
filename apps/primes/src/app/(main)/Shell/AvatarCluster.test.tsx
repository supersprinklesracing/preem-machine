import {
  MOCK_USER_CONTEXT,
  render,
  screen,
  withLoggedInUserContext,
  withLoggedOutUserContext,
} from '@/test-utils';

import { AvatarCluster } from './AvatarCluster';

describe('AvatarCluster', () => {
  it('should render the user avatar when a user is logged in', () => {
    render(<AvatarCluster />, { ...withLoggedInUserContext() });

    const avatarLink = screen.getByRole('link');
    expect(avatarLink).toBeInTheDocument();
    expect(avatarLink).toHaveAttribute(
      'href',
      `/view/user?path=${MOCK_USER_CONTEXT.user?.path}`,
    );

    const avatarImg = screen.getByAltText('Test User');
    expect(avatarImg).toBeInTheDocument();
    expect(avatarImg).toHaveAttribute(
      'src',
      'https://placehold.co/100x100.png',
    );
  });

  it('should render a logged-out avatar that links to the login page', () => {
    render(<AvatarCluster />, { ...withLoggedOutUserContext() });
    const loginLink = screen.getByRole('link');
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', '/login?redirect=/');
  });
});
