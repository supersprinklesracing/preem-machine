'use server';

import { AuthUser } from '@/auth/user';
import { User } from '@/datastore/schema';
import { getUserById } from '@/datastore/server/query/query';
import { notFound, redirect } from 'next/navigation';
import { getAuthUser } from '../../auth/server/auth';
import { AuthError } from '@/auth/errors';
import { NotFoundError } from '../../datastore/errors';
import { UserContextValue } from '../client/UserContext';

const getUser = async (uid: string): Promise<User | null> => {
  try {
    return await getUserById(uid);
  } catch (e: unknown) {
    if (e instanceof NotFoundError) {
      // The user is auth'd but doesn't have a profile.
      return null;
    } else {
      // Something unexepcted happened.
      throw e;
    }
  }
};

export const getUserContext = async (): Promise<UserContextValue> => {
  const authUser = await getAuthUser();
  const user = authUser ? await getUser(authUser.uid) : null;
  return { authUser, user };
};

export const verifyUserContext = async () => {
  const authUser = await getAuthUser();
  if (!authUser) {
    throw new AuthError('You must be logged in to perform this action', 401);
  }
  const user = await getUser(authUser.uid);
  if (!user) {
    notFound();
  }
  return { authUser, user };
};

export const validUserContext = async () => {
  // A user may either be authorized and have a user profile; or they must be
  // unauthorized.
  const authUser = await getAuthUser();
  const user = authUser ? await getUser(authUser.uid) : null;
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
