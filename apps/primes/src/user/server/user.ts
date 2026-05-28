'use server';

import { redirect } from 'next/navigation';

import { AuthUser } from '@/auth/user';
import { User } from '@/datastore/schema';
import { getUserForAuth } from '@/datastore/server/user/user';

import { getAuthUser } from '../../auth/server/auth';
import { UserContextValue } from '../client/UserContext';

export const getUserContext = async (): Promise<UserContextValue> => {
  const authUser = await getAuthUser();
  const user = authUser ? await getUserForAuth(authUser.uid) : null;
  const uid = authUser?.uid ?? null;
  return { uid, authUser, user };
};

export const requireLoggedInUserContext = async (): Promise<{
  uid: string;
  authUser: AuthUser;
  user: User;
}> => {
  const authUser = await getAuthUser();
  if (!authUser) {
    redirect('/login');
  }
  const user = authUser ? await getUserForAuth(authUser.uid) : null;
  if (!user) {
    redirect('/new-user');
  }
  return { uid: authUser.uid, authUser, user };
};

export const requireAnyUserContext = async (): Promise<{
  uid: string | null;
  authUser: AuthUser | null;
  user: User | null;
}> => {
  // A user may either be authorized and have a user profile; or they must be
  // unauthorized.
  const authUser = await getAuthUser();
  const user = authUser ? await getUserForAuth(authUser.uid) : null;
  const uid = authUser?.uid ?? null;
  if (authUser && user) {
    return { uid, authUser, user };
  } else if (authUser && !user) {
    redirect('/new-user');
  } else if (!authUser && user) {
    // This can't ever really happen, cause getUser calls getAuthUser.
    throw Error('Unexpected user state!');
  } else {
    return { uid, authUser, user };
  }
};

export const hasUserRole = async (
  requiredRole: string,
  authUser: AuthUser | null | undefined,
) => {
  const roles = authUser?.customClaims?.roles;
  if (Array.isArray(roles) && roles.includes(requiredRole)) {
    return true;
  }

  // Fail closed.
  return false;
};
