import { createContext, use } from 'react';
import { AuthContextUser } from '../user';

export interface AuthContextValue {
  authUser: AuthContextUser | null;
}

export const AuthContext = createContext<AuthContextValue>({
  authUser: null,
});

export const useAuth = () => use(AuthContext);
