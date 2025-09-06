'use server';

import { verifyAuthUser } from '@/auth/user';
import { FormActionError, FormActionResult } from '@/components/forms/forms';
import { DocPath } from '@/datastore/paths';
import { updateSeries } from '@/datastore/update';
import { getTimestampFromDate } from '@/firebase-admin/dates';
import { z } from 'zod';
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
    const authUser = await verifyAuthUser();
    const parsedEdits = seriesSchema.parse(edits);
    const { startDate, endDate, ...rest } = parsedEdits;
    await updateSeries(
      path,
      {
        ...rest,
        ...(startDate ? { startDate: getTimestampFromDate(startDate) } : {}),
        ...(endDate ? { endDate: getTimestampFromDate(endDate) } : {}),
      },
      authUser,
    );

    return {};
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    throw new FormActionError(`Failed to save series: ${message}`);
  }
}
