'use server';

import { NotFoundError } from '@/datastore/errors';
import { User } from '@/datastore/schema';
import { getUserContext, verifyUserContext } from './user';

import { getAuthUser } from '@/auth/server/auth';
import { getUserById } from '@/datastore/server/query/query';

jest.mock('@/auth/server/auth');
jest.mock('@/datastore/server/query/query');
import { notFound } from 'next/navigation';

jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  notFound: jest.fn(),
}));
const mockGetAuthUser = getAuthUser as jest.Mock;
const mockNotFound = notFound as jest.Mock;
const mockGetUserById = getUserById as jest.Mock;

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
    jest.resetAllMocks();
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

  describe('verifyUserContext', () => {
    it('should throw an AuthError if no auth user is found', async () => {
      mockGetAuthUser.mockResolvedValue(null);
      await expect(verifyUserContext()).rejects.toThrow(
        'You must be logged in to perform this action'
      );
      expect(mockGetUserById).not.toHaveBeenCalled();
      expect(mockNotFound).not.toHaveBeenCalled();
    });

    it('should call notFound if user is not in datastore', async () => {
      mockGetAuthUser.mockResolvedValue(MOCK_AUTH_USER);
      mockGetUserById.mockRejectedValue(new NotFoundError('User not found'));
      await verifyUserContext();
      expect(mockNotFound).toHaveBeenCalledTimes(1);
    });

    it('should return the user if found', async () => {
      mockGetAuthUser.mockResolvedValue(MOCK_AUTH_USER);
      mockGetUserById.mockResolvedValue(MOCK_USER);
      const { authUser, user } = await verifyUserContext();
      expect(user).toEqual(MOCK_USER);
      expect(authUser).toEqual(MOCK_AUTH_USER);
      expect(mockNotFound).not.toHaveBeenCalled();
    });

    it('should re-throw errors other than NotFoundError', async () => {
      const someError = new Error('Something went wrong');
      mockGetAuthUser.mockResolvedValue(MOCK_AUTH_USER);
      mockGetUserById.mockRejectedValue(someError);
      await expect(verifyUserContext()).rejects.toThrow('Something went wrong');
      expect(mockNotFound).not.toHaveBeenCalled();
    });
  });
});
