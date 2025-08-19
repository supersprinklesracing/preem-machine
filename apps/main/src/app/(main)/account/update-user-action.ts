'use server';

import { getAuthUserFromCookies } from '@/auth/user';
import type { User } from '@/datastore/types';
import { getFirestore } from '@/firebase-admin/firebase-admin';

export interface UpdateUserOptions {
  user?: Partial<User>;
}

export async function updateUserAction(
  updateUser: UpdateUserOptions
): Promise<{ ok: boolean; error?: string }> {
  try {
    const authUser = await getAuthUserFromCookies();
    if (!authUser) {
      return { ok: false, error: 'Authentication required.' };
    }

    if (updateUser.user) {
      const db = await getFirestore();
      const userRef = db.collection('users').doc(authUser.uid);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        return { ok: false, error: 'User profile does not exist.' };
      }

      await userRef.update(updateUser.user);
    }

    return { ok: true };
  } catch (error) {
    console.error('Failed to update user document:', error);
    const message =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    return { ok: false, error: `Failed to save profile: ${message}` };
  }
}
