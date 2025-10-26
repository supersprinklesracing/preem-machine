import { DecodedIdToken, UserRecord } from 'firebase-admin/auth';
import { headers } from 'next/headers';

import { AuthUser } from '@/auth/user';
import { getFirebaseAdminApp } from '@/firebase/server/firebase-admin';

import { getBearerUser } from './auth';

jest.mock('next/headers', () => ({
  headers: jest.fn(),
}));

jest.mock('@/firebase/server/firebase-admin', () => ({
  getFirebaseAdminApp: jest.fn(),
}));

const mockedHeaders = headers as jest.Mock;
const mockedGetFirebaseAdminApp = getFirebaseAdminApp as jest.Mock;

describe('getBearerUser', () => {
  let mockVerifyIdToken: jest.Mock;
  let mockGetUser: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockVerifyIdToken = jest.fn();
    mockGetUser = jest.fn();
    mockedGetFirebaseAdminApp.mockResolvedValue({
      auth: () => ({
        verifyIdToken: mockVerifyIdToken,
        getUser: mockGetUser,
      }),
    });
  });

  it('should return null if Authorization header is missing', async () => {
    mockedHeaders.mockReturnValue(new Map());
    const user = await getBearerUser();
    expect(user).toBeNull();
  });

  it('should return null if Authorization header does not start with "Bearer "', async () => {
    mockedHeaders.mockReturnValue(
      new Map([['Authorization', 'Basic some-token']]),
    );
    const user = await getBearerUser();
    expect(user).toBeNull();
  });

  it('should return null if token is missing after "Bearer "', async () => {
    mockedHeaders.mockReturnValue(new Map([['Authorization', 'Bearer ']]));
    const user = await getBearerUser();
    expect(user).toBeNull();
  });

  it('should return null if verifyIdToken throws an error', async () => {
    mockedHeaders.mockReturnValue(
      new Map([['Authorization', 'Bearer invalid-token']]),
    );
    mockVerifyIdToken.mockRejectedValue(new Error('Invalid token'));
    const user = await getBearerUser();
    expect(user).toBeNull();
  });

  it('should return the user if the user is valid', async () => {
    const decodedToken: Partial<DecodedIdToken> = {
      uid: 'test-uid',
    };
    const userRecord: Partial<UserRecord> = {
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
      photoURL: undefined,
      phoneNumber: undefined,
      emailVerified: true,
      customClaims: {
        roles: ['admin'],
      },
      providerData: [
        {
          providerId: 'password',
          uid: 'test-uid',
          email: 'test@example.com',
          displayName: 'Test User',
          photoURL: null,
        },
      ],
    };
    const expectedUser: AuthUser = {
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
      photoURL: null,
      phoneNumber: null,
      emailVerified: true,
      providerId: 'password',
      customClaims: {
        roles: ['admin'],
      },
    };

    mockedHeaders.mockReturnValue(
      new Map([['Authorization', 'Bearer valid-token']]),
    );
    mockVerifyIdToken.mockResolvedValue(decodedToken);
    mockGetUser.mockResolvedValue(userRecord);

    const user = await getBearerUser();

    expect(user).toEqual(expectedUser);
    expect(mockVerifyIdToken).toHaveBeenCalledWith('valid-token');
    expect(mockGetUser).toHaveBeenCalledWith('test-uid');
  });

  it('should return null if getUser throws an error', async () => {
    const decodedToken: Partial<DecodedIdToken> = {
      uid: 'test-uid',
    };
    mockedHeaders.mockReturnValue(
      new Map([['Authorization', 'Bearer valid-token']]),
    );
    mockVerifyIdToken.mockResolvedValue(decodedToken);
    mockGetUser.mockRejectedValue(new Error('User not found'));

    const user = await getBearerUser();
    expect(user).toBeNull();
  });
});
