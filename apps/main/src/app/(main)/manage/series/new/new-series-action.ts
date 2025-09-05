'use server';

import { verifyAuthUser } from '@/auth/user';
import { FormActionError, FormActionResult } from '@/components/forms/forms';
import { createSeries } from '@/datastore/create';
import { DocPath } from '@/datastore/paths';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const newSeriesSchema = z.object({
  name: z.string().min(2, 'Name must have at least 2 letters'),
  location: z.string().optional(),
  website: z.string().optional(),
  description: z.string().min(10, 'Description must have at least 10 letters'),
  startDate: z.string(),
  endDate: z.string(),
});

export async function newSeriesAction(
  path: string,
  options: unknown,
): Promise<FormActionResult<{ path: DocPath }>> {
  try {
    const user = await verifyAuthUser();

    const validation = newSeriesSchema.safeParse(options);

    if (!validation.success) {
      throw new FormActionError('Invalid data.');
    }

    const newSeriesSnapshot = await createSeries(path, validation.data, user);
    const newSeries = newSeriesSnapshot.data();
    if (!newSeries) {
      throw new Error('Failed to create series.');
    }
    revalidatePath(path);
    return { path: newSeries.path };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : 'An unknown error occurred.';
    throw new FormActionError(message);
  }
}
