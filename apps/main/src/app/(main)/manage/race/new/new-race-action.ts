'use server';

import { verifyAuthUser } from '@/auth/user';
import { FormActionError, FormActionResult } from '@/components/forms/forms';
import { createRace } from '@/datastore/create';
import { CollectionPath, DocPath } from '@/datastore/paths';
import { getTimestampFromDate } from '@/firebase-admin/dates';
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
    const user = await verifyAuthUser();

    const validation = raceSchema.safeParse(values);

    if (!validation.success) {
      throw new FormActionError('Invalid data.');
    }

    const { startDate, endDate, ...rest } = validation.data;

    const newRaceSnapshot = await createRace(
      path,
      {
        ...rest,
        ...(startDate ? { startDate: getTimestampFromDate(startDate) } : {}),
        ...(endDate ? { endDate: getTimestampFromDate(endDate) } : {}),
      },
      user,
    );
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
