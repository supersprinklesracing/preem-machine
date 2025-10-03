'use server';

import { revalidatePath } from 'next/cache';
import { z, ZodError } from 'zod';

import { newUserSchema } from '@/app/(main)/account/user-schema';
import { FormActionError, FormActionResult } from '@/components/forms/forms';
import { createUser } from '@/datastore/server/create/create';
import { verifyUserContext } from '@/user/server/user';

export interface NewUserOptions {
  values: z.infer<typeof newUserSchema>;
}

export async function newUserAction({
  values,
}: NewUserOptions): Promise<FormActionResult<{ path: string }>> {
  try {
    const { authUser } = await verifyUserContext();
    const parsedValues = newUserSchema.parse(values);
    const newUserSnapshot = await createUser(parsedValues, authUser);
    const newUser = newUserSnapshot.data();
    if (!newUser) {
      throw new Error(`Failed to create user document`);
    }
    revalidatePath(`/users/${newUserSnapshot.ref.id}`);
    return { path: newUserSnapshot.ref.path };
  } catch (error) {
    if (error instanceof ZodError) {
      throw new FormActionError('Failed to save profile: Validation error');
    }
    const message =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    throw new FormActionError(`Failed to save profile: ${message}`);
  }
}
