'use server';

import { z } from 'zod';

import { FormActionError, FormActionResult } from '@/components/forms/forms';
import { getDoc } from '@/datastore/server/query/query';
import { updateUserAvatar } from '@/datastore/server/update/update';
import { getFirebaseStorage } from '@/firebase/server/firebase-admin';
import { requireLoggedInUserContext } from '@/user/server/user';

import { updateUserAvatarSchema } from './user-schema';

export interface UpdateUserAvatarOptions {
  edits: z.infer<typeof updateUserAvatarSchema>;
}

export async function updateUserAvatarAction({
  edits,
}: UpdateUserAvatarOptions): Promise<FormActionResult> {
  try {
    const { authUser } = await requireLoggedInUserContext();
    const parsedEdits = updateUserAvatarSchema.parse(edits);

    const oldData = await getDoc(
      updateUserAvatarSchema,
      `users/${authUser.uid}`,
    );
    const oldAvatarUrl = oldData?.avatarUrl;

    await updateUserAvatar(parsedEdits, authUser);

    if (oldAvatarUrl && oldAvatarUrl !== parsedEdits.avatarUrl) {
      try {
        const bucket = (await getFirebaseStorage()).bucket();
        const url = new URL(oldAvatarUrl);
        const filePath = url.pathname.substring(1); // remove leading slash
        await bucket.file(filePath).delete();
      } catch (storageError) {
        console.error(
          `Failed to delete old avatar for ${authUser.uid}`,
          storageError,
        );
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
