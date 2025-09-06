'use server';

import { verifyAuthUser } from '@/auth/user';
import { FormActionError, FormActionResult } from '@/components/forms/forms';
import { createEvent } from '@/datastore/create';
import { CollectionPath, DocPath } from '@/datastore/paths';
import { getTimestampFromDate } from '@/firebase-admin/dates';
import { z } from 'zod';
import { eventSchema } from '../event-schema';

export interface NewEventOptions {
  path: CollectionPath;
  values: z.infer<typeof eventSchema>;
}

export async function newEventAction({
  path,
  values,
}: NewEventOptions): Promise<FormActionResult<{ path: DocPath }>> {
  try {
    const authUser = await verifyAuthUser();
    const parsedValues = eventSchema.parse(values);
    const { startDate, endDate, ...rest } = parsedValues;
    const updates = {
      ...rest,
      ...(startDate ? { startDate: getTimestampFromDate(startDate) } : {}),
      ...(endDate ? { endDate: getTimestampFromDate(endDate) } : {}),
    };
    const snap = await createEvent(path, updates, authUser);

    return { path: snap.ref.path };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    throw new FormActionError(`Failed to save event: ${message}`);
  }
}
