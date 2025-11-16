import { getFirebaseAdminApp } from '@/firebase/server/firebase-admin';

import { makeAdmin } from './make-admin-action';

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

jest.mock('@/firebase/server/firebase-admin', () => ({
  getFirebaseAdminApp: jest.fn(),
}));

describe('makeAdmin', () => {
  const setCustomUserClaims = jest.fn();
  const getUser = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (getFirebaseAdminApp as jest.Mock).mockResolvedValue({
      auth: () => ({
        setCustomUserClaims,
        getUser,
      }),
    });
  });

  it('should add admin role to a user', async () => {
    getUser.mockResolvedValue({
      customClaims: { roles: [] },
    });

    await makeAdmin('test-user-id');

    expect(setCustomUserClaims).toHaveBeenCalledWith('test-user-id', {
      roles: ['admin'],
    });
  });

  it('should not add admin role if user is already an admin', async () => {
    getUser.mockResolvedValue({
      customClaims: { roles: ['admin'] },
    });

    await makeAdmin('test-user-id');

    expect(setCustomUserClaims).not.toHaveBeenCalled();
  });

  it('should handle user with no custom claims', async () => {
    getUser.mockResolvedValue({
      customClaims: {},
    });

    await makeAdmin('test-user-id');

    expect(setCustomUserClaims).toHaveBeenCalledWith('test-user-id', {
      roles: ['admin'],
    });
  });

  it('should handle user with undefined custom claims', async () => {
    getUser.mockResolvedValue({});

    await makeAdmin('test-user-id');

    expect(setCustomUserClaims).toHaveBeenCalledWith('test-user-id', {
      roles: ['admin'],
    });
  });
});
