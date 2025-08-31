'use server';

import { verifyAuthUser } from '@/auth/user';
import { createRace } from '@/datastore/create';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const createRaceSchema = z.object({
  name: z.string().min(2, 'Name must have at least 2 letters'),
  location: z.string().min(2, 'Location must have at least 2 letters'),
  date: z.date(),
});

export async function createRaceAction(path: string, options: unknown) {
  try {
    const user = await verifyAuthUser();

    const validation = createRaceSchema.safeParse(options);

    if (!validation.success) {
      return {
        ok: false,
        error: 'Invalid data.',
      };
    }

    const newRaceSnapshot = await createRace(path, validation.data, user);
    const newRace = newRaceSnapshot.data();
    if (!newRace) {
      throw new Error('Failed to create race.');
    }
    revalidatePath(path);
    return { ok: true, raceId: newRace.id };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : 'An unknown error occurred.';
    return {
      ok: false,
      error: message,
    };
  }
}
