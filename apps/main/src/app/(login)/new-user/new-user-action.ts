'use server';

import { userSchema } from '@/app/(main)/account/user-schema';
import { getAuthUser } from '@/auth/user';
import { FormActionError, FormActionResult } from '@/components/forms/forms';
import { createUser } from '@/datastore/create';
import { z } from 'zod';

export interface NewUserOptions {
  values: z.infer<typeof userSchema>;
}

export async function newUserAction({
  values,
}: NewUserOptions): Promise<FormActionResult> {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      throw new FormActionError('Not registered.');
    }

    await createUser(values, authUser);

    return {};
  } catch (error) {
    console.error('Failed to create user document:', error);
    const message =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    throw new FormActionError(`Failed to save profile: ${message}`);
  }
}
