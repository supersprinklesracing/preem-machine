import { render, screen, setupMockDb } from '@/test-utils';
import React from 'react';
import UserPage from './page';
import User from './User';
import { notFound, redirect } from 'next/navigation';
import * as auth from '@/auth/user';
import '../../../../matchMedia.mock';

// Mock dependencies
jest.mock('./User', () => ({
  __esModule: true,
  default: jest.fn(() => <div>Mock User</div>),
}));
jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
  redirect: jest.fn(),
}));
jest.mock('@/auth/user');

setupMockDb();

describe('UserPage component', () => {
  beforeEach(() => {
    (notFound as jest.Mock).mockClear();
    (redirect as jest.Mock).mockClear();
  });

  it('should fetch user data and render the User component', async () => {
    const params = { id: ['user-alex-doe'] };
    const PageComponent = await UserPage({ params });
    render(PageComponent);

    expect(screen.getByText('Mock User')).toBeInTheDocument();

    const userCalls = (User as jest.Mock).mock.calls;
    expect(userCalls[0][0].data.user.id).toBe('user-alex-doe');
  });

  it('should call notFound when the user does not exist', async () => {
    const params = { id: ['non-existent-user'] };
    await UserPage({ params });
    expect(notFound).toHaveBeenCalled();
  });

  it('should redirect to user page when no id is provided and user is logged in', async () => {
    (auth.getAuthUserFromCookies as jest.Mock).mockResolvedValue({
      uid: 'test-uid',
    });
    const params = { id: undefined };
    await UserPage({ params });
    expect(redirect).toHaveBeenCalledWith('/user/test-uid');
  });

  it('should redirect to login page when no id is provided and user is not logged in', async () => {
    (auth.getAuthUserFromCookies as jest.Mock).mockResolvedValue(null);
    const params = { id: undefined };
    await UserPage({ params });
    expect(redirect).toHaveBeenCalledWith('/login?redirect=/user');
  });
});
