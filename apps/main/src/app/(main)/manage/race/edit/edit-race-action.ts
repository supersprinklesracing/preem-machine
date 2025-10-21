'use server';

import { z } from 'zod';

import { FormActionError, FormActionResult } from '@/components/forms/forms';
import { DocPath } from '@/datastore/paths';
import { updateRace } from '@/datastore/server/update/update';
import { requireLoggedInUserContext } from '@/user/server/user';

import { raceSchema } from '../race-schema';

export interface EditRaceOptions {
  path: DocPath;
  edits: z.infer<typeof raceSchema>;
}

export async function editRaceAction({
  path,
  edits,
}: EditRaceOptions): Promise<FormActionResult> {
  try {
    const { authUser } = await requireLoggedInUserContext();
    const parsedEdits = raceSchema.parse(edits);
    await updateRace(path, parsedEdits, authUser);

    return {};
  } catch (error) {
    console.error('Failed to update race document:', error);
    const message =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    throw new FormActionError(`Failed to save race: ${message}`);
  }
}
