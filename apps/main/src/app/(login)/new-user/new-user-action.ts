'use server';

import { getAuthUserFromCookies } from '@/auth/user';
import type { User } from '@/datastore/types';
import { getFirestore } from '@/firebase-admin/firebase-admin';

export interface NewUserOptions {
  user: Partial<User>;
}

interface ActionResult {
  ok: boolean;
  error?: string;
}

export async function newUserAction({
  user,
}: NewUserOptions): Promise<ActionResult> {
  try {
    const authUser = await getAuthUserFromCookies();
    if (!authUser) {
      return { ok: false, error: 'Not registered.' };
    }

    const db = await getFirestore();
    const userRef = db.collection('users').doc(authUser.uid);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      // User already exists, which we treat as a success for redirection purposes.
      return { ok: true };
    }

    await userRef.set(user);

    return { ok: true };
  } catch (error) {
    console.error('Failed to create user document:', error);
    const message =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    return { ok: false, error: `Failed to save profile: ${message}` };
  }
}
