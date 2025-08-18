'use client';

import { FunctionComponent, ReactNode } from 'react';
import { AuthContext, AuthContextUser } from './AuthContext';

export interface AuthProviderProps {
  authUser: AuthContextUser | null;
  children: ReactNode;
}

export const AuthProvider: FunctionComponent<AuthProviderProps> = ({
  authUser,
  children,
}) => {
  return (
    <AuthContext.Provider
      value={{
        authUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
