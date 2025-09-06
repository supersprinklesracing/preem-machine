'use server';

import { verifyAuthUser } from '@/auth/user';
import { FormActionError, FormActionResult } from '@/components/forms/forms';
import { updateRace } from '@/datastore/update';
import { getTimestampFromDate } from '@/firebase-admin/dates';
import { z } from 'zod';
import { raceSchema } from '../race-schema';
import { DocPath } from '@/datastore/paths';

export interface EditRaceOptions {
  path: DocPath;
  edits: z.infer<typeof raceSchema>;
}

export async function editRaceAction({
  path,
  edits,
}: EditRaceOptions): Promise<FormActionResult> {
  try {
    const authUser = await verifyAuthUser();
    const parsedEdits = raceSchema.parse(edits);
    const { startDate, endDate, ...rest } = parsedEdits;
    const updates = {
      ...rest,
      ...(startDate ? { startDate: getTimestampFromDate(startDate) } : {}),
      ...(endDate ? { endDate: getTimestampFromDate(endDate) } : {}),
    };
    await updateRace(path, updates, authUser);

    return {};
  } catch (error) {
    console.error('Failed to update race document:', error);
    const message =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    throw new FormActionError(`Failed to save race: ${message}`);
  }
}
