'use server';

import { verifyAuthUser } from '@/auth/user';
import { FormActionError, FormActionResult } from '@/components/forms/forms';
import { updateUser } from '@/datastore/update';
import { z } from 'zod';

const editUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  photoURL: z.string().url().optional(),
});

export interface EditUserOptions {
  path: string;
  edits: z.infer<typeof editUserSchema>;
}

export async function editUserAction(
  options: EditUserOptions,
): Promise<FormActionResult> {
  try {
    const authUser = await verifyAuthUser();
    const parsedEdits = editUserSchema.parse(options.edits);
    await updateUser(options.path, parsedEdits, authUser);

    return { ok: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    throw new FormActionError(`Failed to save profile: ${message}`);
  }
}
