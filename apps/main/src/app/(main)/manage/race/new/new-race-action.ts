'use server';

import { verifyAuthUser } from '@/auth/user';
import { FormActionError, FormActionResult } from '@/components/forms/forms';
import { createRace } from '@/datastore/create';
import { CollectionPath, DocPath } from '@/datastore/paths';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const newRaceSchema = z.object({
  name: z.string().min(2, 'Name must have at least 2 letters'),
  location: z.string().min(2, 'Location must have at least 2 letters'),
  date: z.date(),
});

export async function newRaceAction(
  path: CollectionPath,
  options: unknown,
): Promise<FormActionResult<{ path: DocPath }>> {
  try {
    const user = await verifyAuthUser();

    const validation = newRaceSchema.safeParse(options);

    if (!validation.success) {
      throw new FormActionError('Invalid data.');
    }

    const newRaceSnapshot = await createRace(path, validation.data, user);
    const newRace = newRaceSnapshot.data();
    if (!newRace) {
      throw new Error('Failed to create race.');
    }
    revalidatePath(path);
    return { path: newRace.path };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : 'An unknown error occurred.';
    throw new FormActionError(message);
  }
}
