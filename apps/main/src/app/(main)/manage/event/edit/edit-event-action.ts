'use server';

import { verifyUserContext } from '@/user/server/user';
import { FormActionError, FormActionResult } from '@/components/forms/forms';
import { DocPath } from '@/datastore/paths';
import { updateEvent } from '@/datastore/server/update/update';
import { z } from 'zod';
import { eventSchema } from '../event-schema';

export interface EditEventOptions {
  path: DocPath;
  edits: z.infer<typeof eventSchema>;
}

export async function editEventAction({
  path,
  edits,
}: EditEventOptions): Promise<FormActionResult> {
  try {
    const { authUser } = await verifyUserContext();
    const parsedEdits = eventSchema.parse(edits);
    await updateEvent(path, parsedEdits, authUser);

    return {};
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    throw new FormActionError(`Failed to save event: ${message}`);
  }
}
