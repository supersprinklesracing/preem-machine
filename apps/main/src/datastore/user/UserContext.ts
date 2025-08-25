import { createContext, use } from 'react';
import { User as BaseUser, ClientCompat } from '../types';

export interface CurrentUser extends ClientCompat<BaseUser> {
  // Make it required, again.
  id: string;
}

export interface CurrentUserContextValue {
  currentUser: CurrentUser | null;
}

export const CurrentUserContext = createContext<CurrentUserContextValue>({
  currentUser: null,
});

export const useCurrentUser = () => use(CurrentUserContext);
