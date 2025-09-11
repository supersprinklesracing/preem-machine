'use client';

import { FunctionComponent, ReactNode, useMemo } from 'react';
import { User } from '../schema';
import { CurrentUserContext } from './UserContext';

export interface UserProviderProps {
  currentUser: User | null;
  children: ReactNode;
}

export const CurrentUserProvider: FunctionComponent<UserProviderProps> = ({
  currentUser,
  children,
}) => {
  const value = useMemo(() => ({ currentUser }), [currentUser]);
  return <CurrentUserContext value={value}>{children}</CurrentUserContext>;
};
