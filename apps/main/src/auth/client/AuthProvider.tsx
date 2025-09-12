'use client';

import { FunctionComponent, ReactNode, useMemo } from 'react';
import { AuthContext } from './AuthContext';
import { AuthContextUser } from '../user';

export interface AuthProviderProps {
  authUser: AuthContextUser | null;
  children: ReactNode;
}

export const AuthProvider: FunctionComponent<AuthProviderProps> = ({
  authUser,
  children,
}) => {
  const value = useMemo(() => ({ authUser }), [authUser]);
  return <AuthContext value={value}>{children}</AuthContext>;
};
