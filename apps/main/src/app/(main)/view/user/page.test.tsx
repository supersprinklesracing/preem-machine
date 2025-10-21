import { redirect } from 'next/navigation';
import React from 'react';

import { NotFoundError } from '@/datastore/errors';
import {
  render,
  screen,
  setupLoggedInUserContext,
  setupLoggedOutUserContext,
  setupMockDb,
} from '@/test-utils';

import UserPage from './page';
import { User } from './User';

// Mock dependencies
jest.mock('./User', () => ({
  __esModule: true,
  User: jest.fn(() => <div>Mock User</div>),
}));
jest.mock('next/navigation', () => ({
  redirect: jest.fn((...args: string[]) => {
    throw new Error(`mock redirect(${args.join(',')})`);
  }),
}));

setupMockDb();

describe('UserPage component', () => {
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

  describe('when user is logged in', () => {
    setupLoggedInUserContext();

    it('should redirect to user page when no id is provided and user is logged in', async () => {
      const searchParams = Promise.resolve({ path: undefined });
      await expect(UserPage({ searchParams })).rejects.toThrow(
        'mock redirect(/view/user/test-user-id)',
      );
    });
  });

  describe('when user is not logged in', () => {
    setupLoggedOutUserContext();

    it('should redirect to login page when no id is provided and user is not logged in', async () => {
      const searchParams = Promise.resolve({ path: undefined });
      await expect(UserPage({ searchParams })).rejects.toThrow(
        'mock redirect(/login?redirect=/view/user)',
      );
    });
  });
});
