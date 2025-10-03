'use server';

import { revalidatePath } from 'next/cache';
import { z, ZodError } from 'zod';

import { newUserSchema } from '@/app/(main)/account/user-schema';
import { FormActionError, FormActionResult } from '@/components/forms/forms';
import { unauthorized } from '@/datastore/errors';
import { createUser } from '@/datastore/server/create/create';
import { getUserContext } from '@/user/server/user';

export interface NewUserOptions {
  values: z.infer<typeof newUserSchema>;
}

export async function newUserAction({
  values,
}: NewUserOptions): Promise<FormActionResult<{ path: string }>> {
  try {
    const authUser = (await getUserContext()).authUser;
    if (!authUser) {
      unauthorized('Not authenticated');
    }
    const parsedValues = newUserSchema.parse(values);
    const { newUser } = await createUser(parsedValues, authUser);
    if (!newUser.exists) {
      throw new Error(`Failed to create user document`);
    }
    revalidatePath(`/view/user/${newUser.ref.id}`);
    return { path: newUser.ref.path };
  } catch (error) {
    if (error instanceof ZodError) {
      throw new FormActionError('Failed to save profile: Validation error');
    }
    const message =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    throw new FormActionError(`Failed to save profile: ${message}`);
  }
}
