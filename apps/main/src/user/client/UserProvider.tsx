'use client';

import { FunctionComponent, ReactNode, useMemo } from "react";
import { UserContext, UserContextValue } from "./UserContext";


export interface UserProviderProps {
  userContext: UserContextValue 
  children: ReactNode;
}

export const UserProvider: FunctionComponent<UserProviderProps> = ({
  userContext,
  children,
}) => {
  const value = useMemo(() => (userContext), [userContext]);
  return <UserContext value={value}>{children}</UserContext>;
};
