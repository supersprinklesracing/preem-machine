'use server';

import { verifyAuthUser } from '@/auth/server/auth';
import { FormActionError, FormActionResult } from '@/components/forms/forms';
import { DocPath } from '@/datastore/paths';
import { updatePreem } from '@/datastore/server/update/update';
import { z } from 'zod';
import { preemSchema } from '../preem-schema';

export interface EditPreemOptions {
  path: DocPath;
  edits: z.infer<typeof preemSchema>;
}

export async function editPreemAction({
  path,
  edits,
}: EditPreemOptions): Promise<FormActionResult> {
  try {
    const authUser = await verifyAuthUser();
    const parsedEdits = preemSchema.parse(edits);
    await updatePreem(path, parsedEdits, authUser);

    return {};
  } catch (error) {
    console.error('Failed to update preem document:', error);
    const message =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    throw new FormActionError(`Failed to save preem: ${message}`);
  }
}
