'use server';

import { verifyAuthUser } from '@/auth/user';
import { createSeries } from '@/datastore/create';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const createSeriesSchema = z.object({
  name: z.string().min(2, 'Name must have at least 2 letters'),
  location: z.string().optional(),
  website: z.string().optional(),
  description: z.string().min(10, 'Description must have at least 10 letters'),
  startDate: z.string(),
  endDate: z.string(),
});

export async function createSeriesAction(path: string, options: unknown) {
  try {
    const user = await verifyAuthUser();

    const validation = createSeriesSchema.safeParse(options);

    if (!validation.success) {
      return {
        ok: false,
        error: 'Invalid data.',
      };
    }

    const newSeriesSnapshot = await createSeries(path, validation.data, user);
    const newSeries = newSeriesSnapshot.data();
    if (!newSeries) {
      throw new Error('Failed to create series.');
    }
    revalidatePath(path);
    return { ok: true, seriesId: newSeries.id };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : 'An unknown error occurred.';
    return {
      ok: false,
      error: message,
    };
  }
}
