'use server';

import { verifyAuthUser } from '@/auth/user';
import { FormActionError, FormActionResult } from '@/components/forms/forms';
import { updateUser } from '@/datastore/server/update/update';
import { z } from 'zod';
import { userSchema } from './user-schema';

export interface EditUserOptions {
  path: string;
  edits: z.infer<typeof userSchema>;
}

export async function editUserAction(
  options: EditUserOptions,
): Promise<FormActionResult> {
  try {
    const authUser = await verifyAuthUser();
    const parsedEdits = userSchema.parse(options.edits);
    await updateUser(options.path, parsedEdits, authUser);

    return {};
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    throw new FormActionError(`Failed to save profile: ${message}`);
  }
}
