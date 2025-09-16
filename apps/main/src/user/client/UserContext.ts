import { createContext, use } from 'react';
import type { User } from '@/datastore/schema';
import { AuthUser } from '@/auth/user';

export interface UserContextValue {
  authUser: AuthUser | null;
  user: User | null;
}

export const UserContext = createContext<UserContextValue>({
  authUser: null,
  user: null,
});

export const useUserContext = () => use(UserContext);
