import { render, screen, setupMockDb } from '@/test-utils';
import React from 'react';
import UserPage from './page';
import User from './User';
import { redirect } from 'next/navigation';
import * as auth from '@/auth/user';
import { NotFoundError } from '@/datastore/errors';
import '@/matchMedia.mock';

// Mock dependencies
jest.mock('./User', () => ({
  __esModule: true,
  default: jest.fn(() => <div>Mock User</div>),
}));
jest.mock('next/navigation', () => ({
  redirect: jest.fn((...args) => {
    throw new Error(`mock redirect(${args.join(',')})`);
  }),
}));
jest.mock('@/auth/user');

setupMockDb();

describe('UserPage component', () => {
  beforeEach(() => {
    (redirect as jest.Mock<(url: string) => never>).mockClear();
  });

  it('should fetch user data and render the User component', async () => {
    const searchParams = { path: 'users/user-alex-doe' };
    const PageComponent = await UserPage({ searchParams });
    render(PageComponent);

    expect(screen.getByText('Mock User')).toBeInTheDocument();

    const userCalls = (User as jest.Mock).mock.calls;
    expect(userCalls[0][0].user.id).toBe('user-alex-doe');
  });

  it('should throw NotFoundError when the user does not exist', async () => {
    const searchParams = { path: 'users/non-existent-user' };
    expect(UserPage({ searchParams })).rejects.toThrow(NotFoundError);
  });

  it('should redirect to user page when no id is provided and user is logged in', async () => {
    (auth.getAuthUser as jest.Mock).mockResolvedValue({
      uid: 'test-uid',
    });
    const searchParams = { path: undefined };
    await expect(UserPage({ searchParams })).rejects.toThrow(
      'mock redirect(/user?path=users/test-uid)',
    );
  });

  it('should redirect to login page when no id is provided and user is not logged in', async () => {
    (auth.getAuthUser as jest.Mock).mockResolvedValue(null);
    const searchParams = { path: undefined };
    await expect(UserPage({ searchParams })).rejects.toThrow(
      'mock redirect(/login?redirect=/user)',
    );
  });
});
