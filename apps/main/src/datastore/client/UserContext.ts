import { createContext, use } from 'react';
import type { User } from '../schema';

export interface CurrentUserContextValue {
  currentUser: User | null;
}

export const CurrentUserContext = createContext<CurrentUserContextValue>({
  currentUser: null,
});

export const useCurrentUser = () => use(CurrentUserContext);
