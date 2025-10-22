'use server';

import { redirect } from 'next/navigation';

import { AuthUser } from '@/auth/user';
import { User } from '@/datastore/schema';
import { getUserForAuth } from '@/datastore/server/user/user';

import { getAuthUser } from '../../auth/server/auth';
import { UserContextValue } from '../client/UserContext';

const getUser = async (): Promise<User | null> => {
  const authUser = await getAuthUser();
  if (!authUser) {
    return null;
  }
  return await getUserForAuth(authUser.uid);
};

export const getUserContext = async (): Promise<UserContextValue> => {
  const authUser = await getAuthUser();
  const user = authUser ? await getUser() : null;
  return { authUser, user };
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
  const user = await getUser();
  if (!user) {
    redirect('/new-user');
  }
  return { uid: authUser.uid, authUser, user };
};

export const requireAnyUserContext = async () => {
  // A user may either be authorized and have a user profile; or they must be
  // unauthorized.
  const authUser = await getAuthUser();
  const user = await getUser();
  if (authUser && user) {
    return { authUser, user };
  } else if (authUser && !user) {
    redirect('/new-user');
  } else if (!authUser && user) {
    // This can't ever really happen, cause getUser calls getAuthUser.
    throw Error('Unexpected user state!');
  } else {
    return { authUser, user };
  }
};

export const hasUserRole = async (
  requiredRole: string,
  authUser: AuthUser,
): Promise<boolean> => {
  const roles = authUser.customClaims?.roles;
  if (Array.isArray(roles) && roles.includes(requiredRole)) {
    return true;
  }

  // Fail closed.
  return false;
};
