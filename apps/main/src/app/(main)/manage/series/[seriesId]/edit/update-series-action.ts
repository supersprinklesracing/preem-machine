'use server';

import { verifyAuthUser } from '@/auth/user';
import { updateSeries } from '@/datastore/update';

export interface UpdateSeriesOptions {
  path: string;
  series: {
    name?: string;
    location?: string;
    website?: string;
    startDate?: string;
    endDate?: string;
  };
}

export async function updateSeriesAction({
  path,
  series,
}: UpdateSeriesOptions): Promise<{ ok: boolean; error?: string }> {
  try {
    const authUser = await verifyAuthUser();
    await updateSeries(path, series, authUser);

    return { ok: true };
  } catch (error) {
    console.error('Failed to update series document:', error);
    const message =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    return { ok: false, error: `Failed to save series: ${message}` };
  }
}
