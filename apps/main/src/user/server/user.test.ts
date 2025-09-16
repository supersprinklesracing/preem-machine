'use server';

import { getAuthUser } from '@/auth/server/auth';
import { NotFoundError } from '@/datastore/errors';
import { User } from '@/datastore/schema';
import { getUserById } from '@/datastore/server/query/query';
import { redirect } from 'next/navigation';
import { getUser, verifyUser } from './user';

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
  name: 'Test User',
  email: 'test@example.com',
  creationTime: new Date().toISOString(),
  lastUpdateTime: new Date().toISOString(),
  photoURL: '',
  timezone: 'America/New_York',
};

const MOCK_AUTH_USER = {
  uid: 'test-user-id',
  email: 'test@example.com',
};

describe('user', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUser', () => {
    it('should return null if no auth user is found', async () => {
      mockGetAuthUser.mockResolvedValue(null);
      const user = await getUser();
      expect(user).toBeNull();
      expect(mockGetUserById).not.toHaveBeenCalled();
    });

    it('should return null if user is not found in datastore', async () => {
      mockGetAuthUser.mockResolvedValue(MOCK_AUTH_USER);
      mockGetUserById.mockRejectedValue(new NotFoundError('User not found'));
      const user = await getUser();
      expect(user).toBeNull();
    });

    it('should return the user if found', async () => {
      mockGetAuthUser.mockResolvedValue(MOCK_AUTH_USER);
      mockGetUserById.mockResolvedValue(MOCK_USER);
      const user = await getUser();
      expect(user).toEqual(MOCK_USER);
    });

    it('should re-throw errors other than NotFoundError', async () => {
      const someError = new Error('Something went wrong');
      mockGetAuthUser.mockResolvedValue(MOCK_AUTH_USER);
      mockGetUserById.mockRejectedValue(someError);
      await expect(getUser()).rejects.toThrow('Something went wrong');
    });
  });

  describe('verifyUser', () => {
    it('should redirect to /login if no auth user is found', async () => {
      mockGetAuthUser.mockResolvedValue(null);
      // We expect a redirect, which is an exception, so we catch it.
      await expect(verifyUser()).rejects.toThrow('NEXT_REDIRECT');
      expect(mockRedirect).toHaveBeenCalledWith('/login');
      expect(mockGetUserById).not.toHaveBeenCalled();
    });

    it('should redirect to /new-user if user is not found in datastore', async () => {
      mockGetAuthUser.mockResolvedValue(MOCK_AUTH_USER);
      mockGetUserById.mockRejectedValue(new NotFoundError('User not found'));
      await expect(verifyUser()).rejects.toThrow('NEXT_REDIRECT');
      expect(mockRedirect).toHaveBeenCalledWith('/new-user');
    });

    it('should return the user if found', async () => {
      mockGetAuthUser.mockResolvedValue(MOCK_AUTH_USER);
      mockGetUserById.mockResolvedValue(MOCK_USER);
      const user = await verifyUser();
      expect(user).toEqual(MOCK_USER);
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it('should re-throw errors other than NotFoundError', async () => {
      const someError = new Error('Something went wrong');
      mockGetAuthUser.mockResolvedValue(MOCK_AUTH_USER);
      mockGetUserById.mockRejectedValue(someError);
      await expect(verifyUser()).rejects.toThrow('Something went wrong');
      expect(mockRedirect).not.toHaveBeenCalled();
    });
  });
});
