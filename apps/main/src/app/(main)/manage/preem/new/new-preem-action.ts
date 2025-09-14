'use server';

import { verifyAuthUser } from '@/auth/server/auth';
import { FormActionError, FormActionResult } from '@/components/forms/forms';
import { createPreem } from '@/datastore/server/create/create';
import { DocPath } from '@/datastore/paths';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { preemSchema } from '../preem-schema';

export interface NewPreemOptions {
  path: DocPath;
  values: z.infer<typeof preemSchema>;
}

export async function newPreemAction({
  path,
  values,
}: NewPreemOptions): Promise<FormActionResult<{ path: DocPath }>> {
  try {
    const authUser = await verifyAuthUser();

    const parsedValues = preemSchema.parse(values);
    const newPreemSnapshot = await createPreem(path, parsedValues, authUser);
    const newPreem = newPreemSnapshot.data();
    if (!newPreem) {
      throw new Error('Failed to create preem.');
    }
    revalidatePath(path);
    return { path: newPreemSnapshot.ref.path };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : 'An unknown error occurred.';
    throw new FormActionError(message);
  }
}
