'use server';

import { userSchema } from '@/app/(main)/account/user-schema';
import { FormActionError, FormActionResult } from '@/components/forms/forms';
import { unauthorized } from '@/datastore/errors';
import { createUser } from '@/datastore/server/create/create';
import { getUserContext } from '@/user/server/user';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export interface NewUserOptions {
  values: z.infer<typeof userSchema>;
}

export async function newUserAction({
  values,
}: NewUserOptions): Promise<FormActionResult> {
  let authUser;
  try {
    authUser = (await getUserContext()).authUser;
    if (!authUser) {
      unauthorized('Not authenticated');
    }
    const parsedValues = userSchema.parse(values);
    const newUserSnapshot = await createUser(parsedValues, authUser);
    const newUser = newUserSnapshot.data();
    if (!newUser) {
      throw new Error(`Failed to create user document`);
    }
    revalidatePath(`user/${newUserSnapshot.ref.id}`);
    return { path: newUserSnapshot.ref.path };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    throw new FormActionError(`Failed to save profile: ${message}`);
  }
}
