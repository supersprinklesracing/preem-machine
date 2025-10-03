'use server';

import { redirect } from 'next/navigation';

import { AuthUser } from '@/auth/user';
import { User } from '@/datastore/schema';
import { getUserById } from '@/datastore/server/query/query';

import { getAuthUser } from '../../auth/server/auth';
import { NotFoundError } from '../../datastore/errors';
import { UserContextValue } from '../client/UserContext';

const getUser = async (): Promise<User | null> => {
  const authUser = await getAuthUser();
  if (!authUser) {
    return null;
  }
  try {
    return await getUserById(authUser.uid);
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
  const user = authUser ? await getUser() : null;
  return { authUser, user };
};

export const verifyUser = async (
  options: {
    requireEmailVerified?: boolean;
    requireProfile?: boolean;
  } = {},
) => {
  const { requireEmailVerified = true, requireProfile = true } = options;

  const authUser = await getAuthUser();

  if (!authUser) {
    redirect('/login');
  }

  if (requireEmailVerified && !authUser.emailVerified) {
    redirect('/verify-email');
  }

  const user = await getUser();

  if (requireProfile && !user) {
    redirect('/new-user');
  }

  return { authUser, user };
};

/**
 * @deprecated Use `verifyUser` instead.
 */
export const verifyUserContext = verifyUser;

/**
 * @deprecated Use `verifyUser` instead.
 */
export const validUserContext = verifyUser;

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
