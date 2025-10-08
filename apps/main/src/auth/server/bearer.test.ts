import { headers } from 'next/headers';
import { getFirebaseAdminApp } from '@/firebase/server/firebase-admin';
import { verifyBearerToken } from './bearer';

jest.mock('next/headers', () => ({
  headers: jest.fn(),
}));

jest.mock('@/firebase/server/firebase-admin', () => ({
  getFirebaseAdminApp: jest.fn(),
}));

const mockedHeaders = headers as jest.Mock;
const mockedGetFirebaseAdminApp = getFirebaseAdminApp as jest.Mock;

describe('verifyBearerToken', () => {
  let mockVerifyIdToken: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockVerifyIdToken = jest.fn();
    mockedGetFirebaseAdminApp.mockResolvedValue({
      auth: () => ({
        verifyIdToken: mockVerifyIdToken,
      }),
    });
  });

  it('should return null if Authorization header is missing', async () => {
    mockedHeaders.mockReturnValue(new Map());
    const token = await verifyBearerToken();
    expect(token).toBeNull();
  });

  it('should return null if Authorization header does not start with "Bearer "', async () => {
    mockedHeaders.mockReturnValue(new Map([['Authorization', 'Basic some-token']]));
    const token = await verifyBearerToken();
    expect(token).toBeNull();
  });

  it('should return null if token is missing after "Bearer "', async () => {
    mockedHeaders.mockReturnValue(new Map([['Authorization', 'Bearer ']]));
    const token = await verifyBearerToken();
    expect(token).toBeNull();
  });

  it('should return null if verifyIdToken throws an error', async () => {
    mockedHeaders.mockReturnValue(new Map([['Authorization', 'Bearer invalid-token']]));
    mockVerifyIdToken.mockRejectedValue(new Error('Invalid token'));
    const token = await verifyBearerToken();
    expect(token).toBeNull();
  });

  it('should return the decoded token if the token is valid', async () => {
    const decoded = { uid: 'test-uid', roles: ['admin'] };
    mockedHeaders.mockReturnValue(new Map([['Authorization', 'Bearer valid-token']]));
    mockVerifyIdToken.mockResolvedValue(decoded);
    const token = await verifyBearerToken();
    expect(token).toEqual(decoded);
    expect(mockVerifyIdToken).toHaveBeenCalledWith('valid-token');
  });
});