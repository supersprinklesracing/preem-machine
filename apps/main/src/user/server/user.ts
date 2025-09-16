'use server';

import { User } from '@/datastore/schema';
import { getUserById } from '@/datastore/server/query/query';
import { redirect } from 'next/navigation';
import { getAuthUser } from '../../auth/server/auth';
import { NotFoundError } from '../../datastore/errors';

export const getUser = async (): Promise<User | null> => {
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

export const verifyUser = async (): Promise<User> => {
  const authUser = await getAuthUser();
  if (!authUser) {
    redirect('/login');
  }
  try {
    return await getUserById(authUser.uid);
  } catch (e: unknown) {
    if (e instanceof NotFoundError) {
      // The user is auth'd but doesn't have a profile.
      redirect('/new-user');
    } else {
      // Something unexepcted happened.
      throw e;
    }
  }
};
