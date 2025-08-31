'use server';

import { verifyAuthUser } from '@/auth/user';
import { updateEvent } from '@/datastore/update';

export interface UpdateEventOptions {
  path: string;
  event: {
    name?: string;
    location?: string;
    website?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
  };
}

export async function updateEventAction({
  path,
  event,
}: UpdateEventOptions): Promise<{ ok: boolean; error?: string }> {
  try {
    const authUser = await verifyAuthUser();
    await updateEvent(path, event, authUser);

    return { ok: true };
  } catch (error) {
    console.error('Failed to update event document:', error);
    const message =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    return { ok: false, error: `Failed to save event: ${message}` };
  }
}
