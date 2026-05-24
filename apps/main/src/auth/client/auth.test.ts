import { UserCredential } from 'firebase/auth';
import { signIn, signOut } from 'next-auth/react';

import { login, loginWithCredential, logout } from './auth';

jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

const mockSignIn = signIn as jest.Mock;
const mockSignOut = signOut as jest.Mock;

describe('auth/client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should call signIn with credentials and token', async () => {
      const token = 'test-token';
      await login(token);

      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        token,
        redirect: false,
      });
    });
  });

  describe('loginWithCredential', () => {
    it('should extract the id token and call signIn correctly', async () => {
      const mockToken = 'mock-id-token';
      const mockCredential = {
        user: {
          getIdToken: jest.fn().mockResolvedValue(mockToken),
        },
      } as unknown as UserCredential;

      await loginWithCredential(mockCredential);

      expect(mockCredential.user.getIdToken).toHaveBeenCalled();
      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        token: mockToken,
        redirect: false,
      });
    });
  });

  describe('logout', () => {
    it('should call signOut with redirect options', async () => {
      await logout();

      expect(mockSignOut).toHaveBeenCalledWith({
        redirect: true,
        callbackUrl: '/login',
      });
    });
  });
});
