'use server';

import { verifyAuthUser } from '@/auth/user';
import { FormActionError, FormActionResult } from '@/components/forms/forms';
import { createSeries } from '@/datastore/create';
import { CollectionPath, DocPath } from '@/datastore/paths';
import { getTimestampFromDate } from '@/firebase-admin/dates';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { seriesSchema } from '../series-schema';

export interface NewSeriesOptions {
  path: CollectionPath;
  values: z.infer<typeof seriesSchema>;
}

export async function newSeriesAction({
  path,
  values,
}: NewSeriesOptions): Promise<FormActionResult<{ path: DocPath }>> {
  try {
    const user = await verifyAuthUser();

    const validation = seriesSchema.safeParse(values);

    if (!validation.success) {
      throw new FormActionError('Invalid data.');
    }

    const { startDate, endDate, ...rest } = validation.data;

    const newSeriesSnapshot = await createSeries(
      path,
      {
        ...rest,
        ...(startDate ? { startDate: getTimestampFromDate(startDate) } : {}),
        ...(endDate ? { endDate: getTimestampFromDate(endDate) } : {}),
      },
      user,
    );
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
