'use server';

import { verifyAuthUser } from '@/auth/user';
import { FormActionError, FormActionResult } from '@/components/forms/forms';
import { updateEvent } from '@/datastore/update';
import { getTimestampFromISODate } from '@/firebase-admin/dates';
import { z } from 'zod';

const editEventSchema = z.object({
  name: z.string().min(2).optional(),
  location: z.string().optional(),
  website: z.string().url().optional(),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export interface EditEventOptions {
  path: string;
  edits: z.infer<typeof editEventSchema>;
}

export async function editEventAction({
  path,
  edits,
}: EditEventOptions): Promise<FormActionResult> {
  try {
    const authUser = await verifyAuthUser();
    const parsedEdits = editEventSchema.parse(edits);
    const { startDate, endDate, ...rest } = parsedEdits;
    const updates = {
      ...rest,
      ...{
        startDate: startDate ? getTimestampFromISODate(startDate) : undefined,
      },
      ...{ endDate: endDate ? getTimestampFromISODate(endDate) : undefined },
    };
    await updateEvent(path, updates, authUser);

    return { ok: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    throw new FormActionError(`Failed to save event: ${message}`);
  }
}
