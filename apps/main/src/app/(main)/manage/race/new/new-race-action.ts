'use server';

import { verifyAuthUser } from '@/auth/server/auth';
import { FormActionError, FormActionResult } from '@/components/forms/forms';
import { createRace } from '@/datastore/server/create/create';
import { CollectionPath, DocPath } from '@/datastore/paths';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { raceSchema } from '../race-schema';

export interface NewRaceOptions {
  path: CollectionPath;
  values: z.infer<typeof raceSchema>;
}

export async function newRaceAction({
  path,
  values,
}: NewRaceOptions): Promise<FormActionResult<{ path: DocPath }>> {
  try {
    const authUser = await verifyAuthUser();

    const parsedValues = raceSchema.parse(values);
    const newRaceSnapshot = await createRace(path, parsedValues, authUser);
    const newRace = newRaceSnapshot.data();
    if (!newRace) {
      throw new Error('Failed to create race.');
    }
    revalidatePath(path);
    return { path: newRaceSnapshot.ref.path };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : 'An unknown error occurred.';
    throw new FormActionError(message);
  }
}
