'use server';

import { getAuthUserFromCookies } from '@/auth/user';
import { createUser } from '@/datastore/create';
import type { User } from '@/datastore/types';

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

    await createUser(user, authUser);

    return { ok: true };
  } catch (error) {
    console.error('Failed to create user document:', error);
    const message =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    return { ok: false, error: `Failed to save profile: ${message}` };
  }
}
