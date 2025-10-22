'use server';

import { z } from 'zod';

import { FormActionError, FormActionResult } from '@/components/forms/forms';
import { getDoc } from '@/datastore/server/query/query';
import { updateUser } from '@/datastore/server/update/update';
import { getFirebaseStorage } from '@/firebase/server/firebase-admin';
import { requireLoggedInUserContext } from '@/user/server/user';

import { updateUserSchema } from './user-schema';

export interface UpdateAvatarOptions {
  avatarUrl: string;
}

export async function updateAvatarAction({
  avatarUrl,
}: UpdateAvatarOptions): Promise<FormActionResult> {
  try {
    const { authUser } = await requireLoggedInUserContext();

    const oldData = await getDoc(updateUserSchema, `users/${authUser.uid}`);
    const oldAvatarUrl = oldData?.avatarUrl;

    await updateUser({ avatarUrl }, authUser);

    if (oldAvatarUrl && oldAvatarUrl !== avatarUrl) {
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
