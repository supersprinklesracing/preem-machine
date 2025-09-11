'use server';

import { userSchema } from '@/app/(main)/account/user-schema';
import { getAuthUser } from '@/auth/user';
import { FormActionError, FormActionResult } from '@/components/forms/forms';
import { createUser } from '@/datastore/server/create/create';
import { revalidatePath } from 'next/cache';
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

    const parsedValues = userSchema.parse(values);
    const newUserSnapshot = await createUser(parsedValues, authUser);
    const newUser = newUserSnapshot.data();
    if (!newUser) {
      throw new Error('Failed to create series.');
    }
    revalidatePath(`users/${newUser.ref.path}`);
    return { path: newUserSnapshot.ref.path };
  } catch (error) {
    console.error('Failed to create user document:', error);
    const message =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    throw new FormActionError(`Failed to save profile: ${message}`);
  }
}
