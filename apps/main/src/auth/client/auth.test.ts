import { UserCredential } from 'firebase/auth';

import { login, loginWithCredential, logout } from './auth';

describe('auth/client', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('login', () => {
    it('should call fetch with the correct arguments', async () => {
      const token = 'test-token';
      await login(token);

      expect(global.fetch).toHaveBeenCalledWith('/api/login', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    });
  });

  describe('loginWithCredential', () => {
    it('should extract the id token and call fetch correctly', async () => {
      const mockToken = 'mock-id-token';
      const mockCredential = {
        user: {
          getIdToken: jest.fn().mockResolvedValue(mockToken),
        },
      } as unknown as UserCredential;

      await loginWithCredential(mockCredential);

      expect(mockCredential.user.getIdToken).toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalledWith('/api/login', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${mockToken}`,
        },
      });
    });
  });

  describe('logout', () => {
    it('should call fetch with the correct arguments', async () => {
      await logout();

      expect(global.fetch).toHaveBeenCalledWith('/api/logout', {
        method: 'GET',
        headers: {},
      });
    });
  });
});
