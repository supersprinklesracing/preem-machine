'use client';

import { FunctionComponent, ReactNode } from 'react';
import { CurrentUser, CurrentUserContext } from './UserContext';

export interface UserProviderProps {
  currentUser: CurrentUser | null;
  children: ReactNode;
}

export const CurrentUserProvider: FunctionComponent<UserProviderProps> = ({
  currentUser,
  children,
}) => {
  return (
    <CurrentUserContext.Provider
      value={{
        currentUser,
      }}
    >
      {children}
    </CurrentUserContext.Provider>
  );
};
