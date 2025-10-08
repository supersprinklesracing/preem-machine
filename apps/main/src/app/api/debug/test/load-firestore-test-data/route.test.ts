import { POST } from './route';
import { verifyBearerToken } from '@/auth/server/bearer';
import { seedFirestore } from '@/datastore/server/mock-db/seed-firestore';
import { getAuthUser } from '@/auth/server/auth';
import { hasUserRole } from '@/user/server/user';
import { NextResponse } from 'next/server';

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({
      json: () => Promise.resolve(body),
      status: init?.status ?? 200,
    })),
  },
}));

jest.mock('@/auth/server/bearer');
jest.mock('@/datastore/server/mock-db/seed-firestore');
jest.mock('@/auth/server/auth');
jest.mock('@/user/server/user');

const mockedVerifyBearerToken = verifyBearerToken as jest.Mock;
const mockedSeedFirestore = seedFirestore as jest.Mock;
const mockedGetAuthUser = getAuthUser as jest.Mock;
const mockedHasUserRole = hasUserRole as jest.Mock;

describe('POST /api/debug/test/load-firestore-test-data', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 403 if bearer token is for a non-admin user', async () => {
    mockedVerifyBearerToken.mockResolvedValue({ roles: ['user'] });

    const request = new Request('http://localhost', { method: 'POST' });
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.success).toBe(false);
    expect(body.error).toBe('Forbidden');
    expect(mockedSeedFirestore).not.toHaveBeenCalled();
  });

  it('should return 403 if cookie auth is for a non-admin user', async () => {
    mockedVerifyBearerToken.mockResolvedValue(null);
    mockedGetAuthUser.mockResolvedValue({ uid: 'test-user' });
    mockedHasUserRole.mockResolvedValue(false);

    const request = new Request('http://localhost', { method: 'POST' });
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.success).toBe(false);
    expect(body.error).toBe('Forbidden');
    expect(mockedSeedFirestore).not.toHaveBeenCalled();
  });

  it('should return 200 and seed firestore if bearer token is for an admin user', async () => {
    mockedVerifyBearerToken.mockResolvedValue({ roles: ['admin'] });

    const request = new Request('http://localhost', { method: 'POST' });
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockedSeedFirestore).toHaveBeenCalled();
  });

  it('should return 200 and seed firestore if cookie auth is for an admin user', async () => {
    mockedVerifyBearerToken.mockResolvedValue(null);
    mockedGetAuthUser.mockResolvedValue({ uid: 'test-admin' });
    mockedHasUserRole.mockResolvedValue(true);

    const request = new Request('http://localhost', { method: 'POST' });
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockedSeedFirestore).toHaveBeenCalled();
  });

  it('should return 403 if no authentication is provided', async () => {
    mockedVerifyBearerToken.mockResolvedValue(null);
    mockedGetAuthUser.mockResolvedValue(null);

    const request = new Request('http://localhost', { method: 'POST' });
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.success).toBe(false);
    expect(body.error).toBe('Forbidden');
    expect(mockedSeedFirestore).not.toHaveBeenCalled();
  });
});