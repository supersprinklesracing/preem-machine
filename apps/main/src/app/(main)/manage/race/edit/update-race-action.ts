'use server';

import { verifyAuthUser } from '@/auth/user';
import { updateRace } from '@/datastore/update';

export interface UpdateRaceOptions {
  path: string;
  race: {
    name?: string;
    location?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
  };
}

export async function updateRaceAction({
  path,
  race,
}: UpdateRaceOptions): Promise<{ ok: boolean; error?: string }> {
  try {
    const authUser = await verifyAuthUser();
    await updateRace(path, race, authUser);

    return { ok: true };
  } catch (error) {
    console.error('Failed to update race document:', error);
    const message =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    return { ok: false, error: `Failed to save race: ${message}` };
  }
}
