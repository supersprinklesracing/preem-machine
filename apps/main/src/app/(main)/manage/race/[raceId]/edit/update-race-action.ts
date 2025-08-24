'use server';

import { verifyAuthUser } from '@/auth/user';
import { updateRace } from '@/datastore/mutations';
import { Race } from '@/datastore/types';

export interface UpdateRaceOptions {
  path: string;
  race: Partial<Omit<Race, 'startDate' | 'endDate'>> & {
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
