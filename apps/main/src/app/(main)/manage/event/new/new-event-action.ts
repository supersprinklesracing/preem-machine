'use server';

import { z } from 'zod';

import { FormActionError, FormActionResult } from '@/components/forms/forms';
import { CollectionPath, DocPath } from '@/datastore/paths';
import { createEvent } from '@/datastore/server/create/create';
import { requireLoggedInUserContext } from '@/user/server/user';

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
    const { authUser } = await requireLoggedInUserContext();

    const parsedValues = eventSchema.parse(values);
    const snap = await createEvent(path, parsedValues, authUser);

    return { path: snap.ref.path };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    throw new FormActionError(`Failed to save event: ${message}`);
  }
}
