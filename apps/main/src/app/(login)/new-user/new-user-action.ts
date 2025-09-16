'use server';

import { userSchema } from '@/app/(main)/account/user-schema';
import { verifyAuthUser } from '@/auth/server/auth';
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
    // They need to really exist.
    const authUser = await verifyAuthUser();

    const parsedValues = userSchema.parse(values);
    const newUserSnapshot = await createUser(
      `users/${authUser.uid}`,
      parsedValues,
      authUser,
    );
    const newUser = newUserSnapshot.data();
    if (!newUser) {
      throw new Error('Failed to create user.');
    }
    revalidatePath(`user/${newUserSnapshot.ref.id}`);
    return { path: newUserSnapshot.ref.path };
  } catch (error) {
    console.error('Failed to create user document:', error);
    const message =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    throw new FormActionError(`Failed to save profile: ${message}`);
  }
}
