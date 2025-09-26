'use server';

import { FormActionError, FormActionResult } from '@/components/forms/forms';
import { getDoc } from '@/datastore/server/query/query';
import { updateUser } from '@/datastore/server/update/update';
import { getFirebaseStorage } from '@/firebase/server/firebase-admin';
import { verifyUserContext } from '@/user/server/user';
import { z } from 'zod';
import { userSchema } from './user-schema';

export interface EditUserOptions {
  path: string;
  edits: z.infer<typeof userSchema>;
}

export async function editUserAction({
  path,
  edits,
}: EditUserOptions): Promise<FormActionResult> {
  try {
    const { authUser } = await verifyUserContext();
    const parsedEdits = userSchema.parse(edits);

    const oldData = await getDoc(userSchema, path);
    const oldAvatarUrl = oldData?.avatarUrl;

    await updateUser(parsedEdits, authUser);

    if (oldAvatarUrl && oldAvatarUrl !== parsedEdits.avatarUrl) {
      try {
        const bucket = (await getFirebaseStorage()).bucket();
        const url = new URL(oldAvatarUrl);
        const filePath = url.pathname.substring(1); // remove leading slash
        await bucket.file(filePath).delete();
      } catch (storageError) {
        console.error('Failed to delete old avatar:', storageError);
        // Don't throw an error back to the user, as the main operation succeeded.
      }
    }

    return {};
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    throw new FormActionError(`Failed to save profile: ${message}`);
  }
}
