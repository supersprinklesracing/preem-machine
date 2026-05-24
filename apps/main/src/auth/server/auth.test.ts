import { DecodedIdToken, UserInfo, UserRecord } from 'firebase-admin/auth';
import { headers } from 'next/headers';

import { auth } from '@/auth';
import { AuthUser } from '@/auth/user';
import { getFirebaseAdminApp } from '@/firebase/server/firebase-admin';

import { getAuthUser, getBearerUser } from './auth';

jest.mock('@preem-machine/env', () => {
  const originalModule = jest.requireActual('@preem-machine/env');
  return {
    __esModule: true,
    ...originalModule,
    get ENV_E2E_TESTING() {
      return process.env.ENV_E2E_TESTING === 'true';
    },
  };
});

jest.mock('./auth-context-user', () => ({
  ...(jest.requireActual('./auth-context-user') as object),
  toAuthContextUserFromDecodedToken: jest.fn((user) => user),
}));

jest.mock('next/headers', () => ({
  headers: jest.fn(),
  cookies: jest.fn(),
}));

jest.mock('@/auth', () => ({
  auth: jest.fn(),
}));

jest.mock('@/firebase/server/firebase-admin', () => ({
  getFirebaseAdminApp: jest.fn(),
}));

const mockedHeaders = headers as jest.Mock;
const mockedGetFirebaseAdminApp = getFirebaseAdminApp as jest.Mock;
const mockAuth = auth as jest.Mock;

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
          photoURL: '',
        } as unknown as UserInfo,
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

describe('getAuthUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return the user from the X-e2e-auth-user header during E2E testing', async () => {
    process.env.ENV_E2E_TESTING = 'true';
    const e2eUser: AuthUser = {
      uid: 'e2e-test-uid',
      email: 'e2e@example.com',
      displayName: 'E2E Test User',
      photoURL: null,
      phoneNumber: null,
      emailVerified: true,
      providerId: 'password',
      customClaims: {},
    };
    mockedHeaders.mockReturnValue(
      new Map([['X-e2e-auth-user', JSON.stringify(e2eUser)]]),
    );

    const user = await getAuthUser();
    expect(user).toEqual(e2eUser);
  });

  it('should throw an error for a misconfigured E2E user', async () => {
    process.env.ENV_E2E_TESTING = 'true';
    const invalidE2eUser = { email: 'e2e@example.com' };
    mockedHeaders.mockReturnValue(
      new Map([['X-e2e-auth-user', JSON.stringify(invalidE2eUser)]]),
    );
    await expect(getAuthUser()).rejects.toThrow(
      'Misconfigured E2E Testing User in header',
    );
  });

  it('should throw an error for malformed JSON in the E2E user header', async () => {
    process.env.ENV_E2E_TESTING = 'true';
    mockedHeaders.mockReturnValue(
      new Map([['X-e2e-auth-user', 'invalid-json']]),
    );
    await expect(getAuthUser()).rejects.toThrow(
      'Malformed JSON in X-e2e-auth-user header',
    );
  });

  it('should return null if no tokens are found and not in E2E testing mode', async () => {
    process.env.ENV_E2E_TESTING = 'false';
    mockAuth.mockResolvedValue(null);
    const user = await getAuthUser();
    expect(user).toBeNull();
  });

  it('should return the user from tokens if not in E2E testing mode', async () => {
    process.env.ENV_E2E_TESTING = 'false';
    const tokenUser: AuthUser = {
      uid: 'token-test-uid',
      email: 'token@example.com',
      displayName: 'Token Test User',
      photoURL: null,
      phoneNumber: null,
      emailVerified: true,
      providerId: 'next-auth',
      customClaims: {},
    };
    mockAuth.mockResolvedValue({
      user: {
        id: 'token-test-uid',
        email: 'token@example.com',
        name: 'Token Test User',
        image: null,
      },
    });
    const user = await getAuthUser();
    expect(user).toEqual(tokenUser);
  });

  afterEach(() => {
    delete process.env.ENV_E2E_TESTING;
  });
});
