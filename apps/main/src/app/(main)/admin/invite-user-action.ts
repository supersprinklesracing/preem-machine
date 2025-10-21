'use server';

import { z } from 'zod';

import { FormActionError, FormActionResult } from '@/components/forms/forms';
import { createInvite } from '@/datastore/server/create/create';
import { hasUserRole, requireLoggedInUserContext } from '@/user/server/user';

import { inviteSchema } from './invite-schema';

export interface InviteUserOptions {
  edits: z.infer<typeof inviteSchema>;
}

export async function inviteUser({
  edits,
}: InviteUserOptions): Promise<FormActionResult> {
  try {
    const { authUser } = await requireLoggedInUserContext();
    const isAdmin = await hasUserRole('admin', authUser);
    if (!isAdmin) {
      throw new Error('Unauthorized');
    }
    const parsedInvite = inviteSchema.parse(edits);
    await createInvite(parsedInvite, authUser);

    return {};
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    throw new FormActionError(`Failed to send invitation: ${message}`);
  }
}
