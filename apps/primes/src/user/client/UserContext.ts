import { createContext, use } from 'react';

import { AuthUser } from '@/auth/user';
import type { User } from '@/datastore/schema';

export interface UserContextValue {
  uid: string | null;
  authUser: AuthUser | null;
  user: User | null;
}

export const UserContext = createContext<UserContextValue>({
  uid: null,
  authUser: null,
  user: null,
});

export const useUserContext = () => use(UserContext);
