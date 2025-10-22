'use server';

import { z } from 'zod';

import { FormActionError, FormActionResult } from '@/components/forms/forms';
import { updateUser } from '@/datastore/server/update/update';
import { requireLoggedInUserContext } from '@/user/server/user';

import { updateUserSchema } from './user-schema';

export interface EditUserOptions {
  edits: z.infer<typeof updateUserSchema>;
}

export async function editUserAction({
  edits,
}: EditUserOptions): Promise<FormActionResult> {
  try {
    const { authUser } = await requireLoggedInUserContext();
    const parsedEdits = updateUserSchema.parse(edits);

    await updateUser(parsedEdits, authUser);

    return {};
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    throw new FormActionError(`Failed to save profile: ${message}`);
  }
}
