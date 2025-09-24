import { render, screen, setupMockDb, setupUserContext } from '@/test-utils';
import React from 'react';
import UserPage from './page';
import User from './User';
import { redirect } from 'next/navigation';
import { NotFoundError } from '@/datastore/errors';

// Mock dependencies
jest.mock('./User', () => ({
  __esModule: true,
  default: jest.fn(() => <div>Mock User</div>),
}));
jest.mock('next/navigation', () => ({
  redirect: jest.fn((...args: string[]) => {
    throw new Error(`mock redirect(${args.join(',')})`);
  }),
}));

setupMockDb();

describe('UserPage component', () => {
  const { mockedGetUserContext } = setupUserContext();

  beforeEach(() => {
    (redirect as unknown as jest.Mock).mockClear();
  });

  it('should fetch user data and render the User component', async () => {
    const searchParams = Promise.resolve({ path: 'users/user-alex-doe' });
    const PageComponent = await UserPage({ searchParams });
    render(PageComponent);

    expect(screen.getByText('Mock User')).toBeInTheDocument();

    const userCalls = (User as jest.Mock).mock.calls;
    expect(userCalls[0][0].user.id).toBe('user-alex-doe');
  });

  it('should throw NotFoundError when the user does not exist', async () => {
    const searchParams = Promise.resolve({ path: 'users/non-existent-user' });
    expect(UserPage({ searchParams })).rejects.toThrow(NotFoundError);
  });

  it('should redirect to user page when no id is provided and user is logged in', async () => {
    mockedGetUserContext.mockResolvedValue({
      authUser: { uid: 'test-uid' },
      user: { id: 'test-uid' },
    });
    const searchParams = Promise.resolve({ path: undefined });
    await expect(UserPage({ searchParams })).rejects.toThrow(
      'mock redirect(/user/test-uid)',
    );
  });

  it('should redirect to login page when no id is provided and user is not logged in', async () => {
    mockedGetUserContext.mockResolvedValue({
      authUser: null,
      user: null,
    });
    const searchParams = Promise.resolve({ path: undefined });
    await expect(UserPage({ searchParams })).rejects.toThrow(
      'mock redirect(/login?redirect=/user)',
    );
  });
});
