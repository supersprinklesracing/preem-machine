'use server';

import { verifyAuthUser } from '@/auth/user';
import { FormActionError, FormActionResult } from '@/components/forms/forms';
import { updateRace } from '@/datastore/update';
import { getTimestampFromISODate } from '@/firebase-admin/dates';
import { z } from 'zod';

const editRaceSchema = z.object({
  name: z.string().min(2).optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  website: z.string().url().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export interface EditRaceOptions {
  path: string;
  edits: z.infer<typeof editRaceSchema>;
}

export async function editRaceAction({
  path,
  edits,
}: EditRaceOptions): Promise<FormActionResult> {
  try {
    const authUser = await verifyAuthUser();
    const parsedEdits = editRaceSchema.parse(edits);
    const { startDate, endDate, ...rest } = parsedEdits;
    const updates = {
      ...rest,
      ...{
        startDate: startDate ? getTimestampFromISODate(startDate) : undefined,
      },
      ...{ endDate: endDate ? getTimestampFromISODate(endDate) : undefined },
    };
    await updateRace(path, updates, authUser);

    return { ok: true };
  } catch (error) {
    console.error('Failed to update race document:', error);
    const message =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    throw new FormActionError(`Failed to save race: ${message}`);
  }
}
