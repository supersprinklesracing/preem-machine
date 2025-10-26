import { getBearerUser } from '@/auth/server/auth';
import { seedFirestore } from '@/datastore/server/mock-db/seed-firestore';
import { MOCK_ADMIN_AUTH_USER, MOCK_AUTH_USER } from '@/test-utils';
import { hasUserRole } from '@/user/server/user';

import { POST } from './route';

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({
      json: () => Promise.resolve(body),
      status: init?.status ?? 200,
    })),
  },
}));

jest.mock('@/datastore/server/mock-db/seed-firestore');
jest.mock('@/auth/server/auth');
jest.mock('@/user/server/user');
jest.mock('@/env/env', () => ({
  ...jest.requireActual('@/env/env'),
  ENV_E2E_TESTING: false,
}));

const mockedGetBearerUser = getBearerUser as jest.Mock;
const mockedSeedFirestore = seedFirestore as jest.Mock;
const mockedHasUserRole = hasUserRole as jest.Mock;

describe('POST /api/debug/test/load-firestore-test-data', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => { /* empty */ });
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('should return 403 if bearer token is for a non-admin user', async () => {
    mockedGetBearerUser.mockResolvedValue(MOCK_AUTH_USER);
    mockedHasUserRole.mockResolvedValue(false);

    const request = new Request('http://localhost', { method: 'POST' });
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.success).toBe(false);
    expect(body.error).toBe('Forbidden');
    expect(mockedSeedFirestore).not.toHaveBeenCalled();
  });

  it('should return 403 if cookie auth is for a non-admin user', async () => {
    mockedGetBearerUser.mockResolvedValue(null);
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
    mockedGetBearerUser.mockResolvedValue(MOCK_ADMIN_AUTH_USER);
    mockedHasUserRole.mockResolvedValue(true);

    const request = new Request('http://localhost', { method: 'POST' });
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockedSeedFirestore).toHaveBeenCalled();
  });

  it('should return 200 and seed firestore if cookie auth is for an admin user', async () => {
    mockedGetBearerUser.mockResolvedValue(null);
    mockedHasUserRole.mockResolvedValue(true);

    const request = new Request('http://localhost', { method: 'POST' });
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockedSeedFirestore).toHaveBeenCalled();
  });

  it('should return 403 if no authentication is provided', async () => {
    mockedGetBearerUser.mockResolvedValue(null);
    mockedHasUserRole.mockResolvedValue(false);

    const request = new Request('http://localhost', { method: 'POST' });
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.success).toBe(false);
    expect(body.error).toBe('Forbidden');
    expect(mockedSeedFirestore).not.toHaveBeenCalled();
  });

  it('should return 500 if seeding firestore fails', async () => {
    mockedGetBearerUser.mockResolvedValue(MOCK_ADMIN_AUTH_USER);
    mockedHasUserRole.mockResolvedValue(true);
    const errorMessage = 'Firestore seeding failed';
    mockedSeedFirestore.mockRejectedValue(new Error(errorMessage));

    const request = new Request('http://localhost', { method: 'POST' });
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.success).toBe(false);
    expect(body.error).toBe(errorMessage);
    expect(console.error).toHaveBeenCalled();
  });
});