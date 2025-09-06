'use server';

import { verifyAuthUser } from '@/auth/user';
import { FormActionError, FormActionResult } from '@/components/forms/forms';
import { updateEvent } from '@/datastore/update';
import { getTimestampFromDate } from '@/firebase-admin/dates';
import { z } from 'zod';
import { eventSchema } from '../event-schema';
import { DocPath } from '@/datastore/paths';

export interface EditEventOptions {
  path: DocPath;
  edits: z.infer<typeof eventSchema>;
}

export async function editEventAction({
  path,
  edits,
}: EditEventOptions): Promise<FormActionResult> {
  try {
    const authUser = await verifyAuthUser();
    const parsedEdits = eventSchema.parse(edits);
    const { startDate, endDate, ...rest } = parsedEdits;
    const updates = {
      ...rest,
      ...(startDate ? { startDate: getTimestampFromDate(startDate) } : {}),
      ...(endDate ? { endDate: getTimestampFromDate(endDate) } : {}),
    };
    await updateEvent(path, updates, authUser);

    return {};
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    throw new FormActionError(`Failed to save event: ${message}`);
  }
}
