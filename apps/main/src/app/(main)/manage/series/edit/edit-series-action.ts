'use server';

import { z } from 'zod';

import { FormActionError, FormActionResult } from '@/components/forms/forms';
import { DocPath } from '@/datastore/paths';
import { updateSeries } from '@/datastore/server/update/update';
import { requireLoggedInUserContext } from '@/user/server/user';

import { seriesSchema } from '../series-schema';

export interface EditSeriesOptions {
  path: DocPath;
  edits: z.infer<typeof seriesSchema>;
}

export async function editSeriesAction({
  path,
  edits,
}: EditSeriesOptions): Promise<FormActionResult> {
  try {
    const { authUser } = await requireLoggedInUserContext();
    const parsedEdits = seriesSchema.parse(edits);
    await updateSeries(path, parsedEdits, authUser);

    return {};
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    throw new FormActionError(`Failed to save series: ${message}`);
  }
}
