'use server';

import { FormActionError } from '@/components/forms/forms';
import { User } from '@/datastore/schema';
import * as create from '@/datastore/server/create/create';
import * as user from '@/user/server/user';
import { revalidatePath } from 'next/cache';
import { AuthUser } from './auth/user';
import { newUserAction } from './new-user-action';

jest.mock('@/user/server/user');
jest.mock('@/datastore/server/create/create');
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

const MOCK_AUTH_USER: AuthUser = {
  uid: 'test-user-1',
  name: 'Test User',
  email: 'test-user@example.com',
  avatarUrl: 'https://placehold.co/100x100.png',
  termsAccepted: true,
  affiliation: '',
  raceLicenseId: '',
  address: '',
};

const MOCK_USER_VALUES: User = {
  name: 'Test User',
  email: 'test-user@example.com',
  avatarUrl: 'https://placehold.co/100x100.png',
  termsAccepted: true,
  affiliation: '',
  raceLicenseId: '',
  address: '',
};

describe('newUserAction', () => {
  const mockedGetUserContext = jest.mocked(user.getUserContext);
  const mockedCreateUser = jest.mocked(create.createUser);
  const mockedRevalidatePath = jest.mocked(revalidatePath);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new user and return the path on success', async () => {
    mockedGetUserContext.mockResolvedValue({
      authUser: MOCK_AUTH_USER,
      user: null,
    });
    const mockSnapshot = {
      ref: { id: 'new-user-id', path: 'users/new-user-id' },
      data: () => ({ ...MOCK_USER_VALUES, id: 'new-user-id' }),
    };
    mockedCreateUser.mockResolvedValue(mockSnapshot as any);

    const result = await newUserAction({ values: MOCK_USER_VALUES });

    expect(mockedCreateUser).toHaveBeenCalledWith(
      expect.objectContaining(MOCK_USER_VALUES),
      MOCK_AUTH_USER,
    );
    expect(mockedRevalidatePath).toHaveBeenCalledWith('user/new-user-id');
    expect(result).toEqual({ path: 'users/new-user-id' });
  });

  it('should throw a FormActionError if no authUser is found', async () => {
    mockedGetUserContext.mockResolvedValue({ authUser: null, user: null });

    await expect(newUserAction({ values: MOCK_USER_VALUES })).rejects.toThrow(
      new FormActionError('Failed to save profile: Not authenticated'),
    );
  });

  it('should throw a FormActionError if user creation fails', async () => {
    mockedGetUserContext.mockResolvedValue({
      authUser: MOCK_AUTH_USER,
      user: null,
    });
    mockedCreateUser.mockRejectedValue(new Error('Firestore error'));

    await expect(newUserAction({ values: MOCK_USER_VALUES })).rejects.toThrow(
      new FormActionError('Failed to save profile: Firestore error'),
    );
  });

  it('should throw a FormActionError if the created user data is missing', async () => {
    mockedGetUserContext.mockResolvedValue({
      authUser: MOCK_AUTH_USER,
      user: null,
    });
    const mockSnapshot = {
      ref: { id: 'new-user-id', path: 'users/new-user-id' },
      data: () => null,
    };
    mockedCreateUser.mockResolvedValue(mockSnapshot as any);

    await expect(newUserAction({ values: MOCK_USER_VALUES })).rejects.toThrow(
      new FormActionError(
        'Failed to save profile: Failed to create user document',
      ),
    );
  });

  it('should throw a FormActionError for invalid input data', async () => {
    mockedGetUserContext.mockResolvedValue({
      authUser: MOCK_AUTH_USER,
      user: null,
    });
    const invalidValues = { ...MOCK_USER_VALUES, avatarUrl: 'not-a-valid-url' }; // Invalid avatarUrl

    await expect(newUserAction({ values: invalidValues })).rejects.toThrow(
      /Invalid URL/,
    );
  });
});
