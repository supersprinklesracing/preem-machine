import { UserInfo } from 'firebase/auth';
import { Claims } from 'next-firebase-auth-edge/lib/auth/claims';
import { createContext, use } from 'react';

export interface AuthContextUser extends UserInfo {
  emailVerified: boolean;
  customClaims: Claims;
  token: string;
  customToken?: string;
}

export interface AuthContextValue {
  authUser: AuthContextUser | null;
}

export const AuthContext = createContext<AuthContextValue>({
  authUser: null,
});

export const useAuth = () => use(AuthContext);
