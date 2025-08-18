import { UserInfo } from 'firebase/auth';
import { Claims } from 'next-firebase-auth-edge/lib/auth/claims';
import { createContext, useContext } from 'react';

export interface AuthContextUser extends UserInfo {
  id: string;

  idToken: string;
  customToken?: string;
  emailVerified: boolean;
  customClaims: Claims;
}

export interface AuthContextValue {
  authUser: AuthContextUser | null;
}

export const AuthContext = createContext<AuthContextValue>({
  authUser: null,
});

export const useAuth = () => useContext(AuthContext);
