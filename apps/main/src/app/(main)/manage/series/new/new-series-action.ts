'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { FormActionError, FormActionResult } from '@/components/forms/forms';
import { CollectionPath, DocPath } from '@/datastore/paths';
import { createSeries } from '@/datastore/server/create/create';
import { verifyUserContext } from '@/user/server/user';

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
    const { authUser } = await verifyUserContext();

    const parsedValues = seriesSchema.parse(values);
    const newSeriesSnapshot = await createSeries(path, parsedValues, authUser);
    const newSeries = newSeriesSnapshot.data();
    if (!newSeries) {
      throw new Error('Failed to create series.');
    }
    revalidatePath(path);
    return { path: newSeriesSnapshot.ref.path };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : 'An unknown error occurred.';
    throw new FormActionError(message);
  }
}
