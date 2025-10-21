'use server';

import { redirect } from 'next/navigation';

import { getAuthUser } from '@/auth/server/auth';
import { NotFoundError } from '@/datastore/errors';
import { User } from '@/datastore/schema';
import { getUserById } from '@/datastore/server/query/query';

import { getUserContext, requireLoggedInUserContext } from './user';

jest.mock('@/auth/server/auth');
jest.mock('@/datastore/server/query/query');
jest.mock('next/navigation', () => ({
  redirect: jest.fn(() => {
    throw new Error('NEXT_REDIRECT');
  }),
}));

const mockGetAuthUser = getAuthUser as jest.Mock;
const mockGetUserById = getUserById as jest.Mock;
const mockRedirect = redirect as unknown as jest.Mock;

const MOCK_USER: User = {
  id: 'test-user-id',
  path: 'users/test-user-id',
  name: 'Test User',
  email: 'test@example.com',
};

const MOCK_AUTH_USER = {
  uid: 'test-user-id',
  email: 'test@example.com',
};

describe('user', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserContext', () => {
    it('should return nulls if no auth user is found', async () => {
      mockGetAuthUser.mockResolvedValue(null);
      const { authUser, user } = await getUserContext();
      expect(authUser).toBeNull();
      expect(user).toBeNull();
      expect(mockGetUserById).not.toHaveBeenCalled();
    });

    it('should return authUser and null user if user is not found in datastore', async () => {
      mockGetAuthUser.mockResolvedValue(MOCK_AUTH_USER);
      mockGetUserById.mockRejectedValue(new NotFoundError('User not found'));
      const { authUser, user } = await getUserContext();
      expect(authUser).toEqual(MOCK_AUTH_USER);
      expect(user).toBeNull();
    });

    it('should return the authUser and user if found', async () => {
      mockGetAuthUser.mockResolvedValue(MOCK_AUTH_USER);
      mockGetUserById.mockResolvedValue(MOCK_USER);
      const { authUser, user } = await getUserContext();
      expect(authUser).toEqual(MOCK_AUTH_USER);
      expect(user).toEqual(MOCK_USER);
    });

    it('should re-throw errors other than NotFoundError', async () => {
      const someError = new Error('Something went wrong');
      mockGetAuthUser.mockResolvedValue(MOCK_AUTH_USER);
      mockGetUserById.mockRejectedValue(someError);
      await expect(getUserContext()).rejects.toThrow('Something went wrong');
    });
  });

  describe('requireLoggedInUserContext', () => {
    it('should redirect to /login if no auth user is found', async () => {
      mockGetAuthUser.mockResolvedValue(null);
      // We expect a redirect, which is an exception, so we catch it.
      await expect(requireLoggedInUserContext()).rejects.toThrow(
        'NEXT_REDIRECT',
      );
      expect(mockRedirect).toHaveBeenCalledWith('/login');
      expect(mockGetUserById).not.toHaveBeenCalled();
    });

    it('should redirect to /new-user if user is not found in datastore', async () => {
      mockGetAuthUser.mockResolvedValue(MOCK_AUTH_USER);
      mockGetUserById.mockRejectedValue(new NotFoundError('User not found'));
      await expect(requireLoggedInUserContext()).rejects.toThrow(
        'NEXT_REDIRECT',
      );
      expect(mockRedirect).toHaveBeenCalledWith('/new-user');
    });

    it('should return the user if found', async () => {
      mockGetAuthUser.mockResolvedValue(MOCK_AUTH_USER);
      mockGetUserById.mockResolvedValue(MOCK_USER);
      const { authUser, user } = await requireLoggedInUserContext();
      expect(user).toEqual(MOCK_USER);
      expect(authUser).toEqual(MOCK_AUTH_USER);
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it('should re-throw errors other than NotFoundError', async () => {
      const someError = new Error('Something went wrong');
      mockGetAuthUser.mockResolvedValue(MOCK_AUTH_USER);
      mockGetUserById.mockRejectedValue(someError);
      await expect(requireLoggedInUserContext()).rejects.toThrow(
        'Something went wrong',
      );
      expect(mockRedirect).not.toHaveBeenCalled();
    });
  });
});
