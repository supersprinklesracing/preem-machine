import { DocumentSnapshot } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';

import { FormActionError } from '@/components/forms/forms';
import { User } from '@/datastore/schema';
import { createUser } from '@/datastore/server/create/create';
import {
  MOCK_USER_CONTEXT,
  setupLoggedInUserContext,
  setupLoggedOutUserContext,
} from '@/test-utils';

import { newUserAction } from './new-user-action';

jest.mock('@/user/server/user');
jest.mock('@/datastore/server/create/create');
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

const MOCK_USER_VALUES: Omit<User, 'id' | 'path' | 'roles' | 'metadata'> = {
  name: 'Test User',
  email: 'test-user@example.com',
  avatarUrl: 'https://placehold.co/100x100.png',
  termsAccepted: true,
};

describe('newUserAction', () => {
  const mockedCreateUser = jest.mocked(createUser);
  const mockedRevalidatePath = jest.mocked(revalidatePath);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when authenticated', () => {
    setupLoggedInUserContext();

    it('should create a new user and return the path on success', async () => {
      const mockNewUserDetails = { ...MOCK_USER_VALUES, id: 'new-user-id' };
      const mockSnapshot = {
        ref: { id: 'new-user-id', path: 'users/new-user-id' },
        data: () => mockNewUserDetails,
        exists: true,
      } as unknown as DocumentSnapshot;
      mockedCreateUser.mockResolvedValue({
        newUserDetails: mockNewUserDetails,
        newUser: mockSnapshot,
      });

      const result = await newUserAction({ values: MOCK_USER_VALUES });

      expect(mockedCreateUser).toHaveBeenCalledWith(
        expect.objectContaining(MOCK_USER_VALUES),
        MOCK_USER_CONTEXT.authUser,
      );
      expect(mockedRevalidatePath).toHaveBeenCalledWith(
        '/view/user/new-user-id',
      );
      expect(result).toEqual({ path: 'users/new-user-id' });
    });

    it('should throw a FormActionError if user creation fails', async () => {
      mockedCreateUser.mockRejectedValue(new Error('Firestore error'));

      await expect(newUserAction({ values: MOCK_USER_VALUES })).rejects.toThrow(
        new FormActionError('Failed to save profile: Firestore error'),
      );
    });

    it('should throw a FormActionError if the created user data is missing', async () => {
      const mockSnapshot = {
        ref: { id: 'new-user-id', path: 'users/new-user-id' },
        data: () => null,
        exists: false,
      } as unknown as DocumentSnapshot;
      mockedCreateUser.mockResolvedValue({
        newUser: mockSnapshot,
        newUserDetails: undefined,
      });

      await expect(newUserAction({ values: MOCK_USER_VALUES })).rejects.toThrow(
        new FormActionError(
          'Failed to save profile: Failed to create user document',
        ),
      );
    });

    it('should throw a FormActionError for invalid input data', async () => {
      const invalidValues = {
        ...MOCK_USER_VALUES,
        avatarUrl: 'not-a-valid-url',
      }; // Invalid avatarUrl

      await expect(newUserAction({ values: invalidValues })).rejects.toThrow(
        'Failed to save profile: Validation error',
      );
    });
  });

  describe('when not authenticated', () => {
    setupLoggedOutUserContext();

    it('should throw a FormActionError if no authUser is found', async () => {
      await expect(newUserAction({ values: MOCK_USER_VALUES })).rejects.toThrow(
        new FormActionError('Failed to save profile: Not authenticated'),
      );
    });
  });
});
