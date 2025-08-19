'use server';

import { verifyAuthUser } from '@/auth/user';
import { updateUser } from '@/datastore/mutations';
import type { User } from '@/datastore/types';

export interface UpdateUserOptions {
  path: string;
  user: Partial<User>;
}

export async function updateUserAction(
  options: UpdateUserOptions
): Promise<{ ok: boolean; error?: string }> {
  try {
    const authUser = await verifyAuthUser();
    await updateUser(options.path, options.user, authUser);

    return { ok: true };
  } catch (error) {
    console.error('Failed to update user document:', error);
    const message =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    return { ok: false, error: `Failed to save profile: ${message}` };
  }
}
