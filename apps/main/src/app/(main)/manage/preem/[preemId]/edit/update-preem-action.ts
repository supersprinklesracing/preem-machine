'use server';

import { verifyAuthUser } from '@/auth/user';
import { updatePreem } from '@/datastore/mutations';
import { Preem } from '@/datastore/types';

export interface UpdatePreemOptions {
  path: string;
  preem: Partial<Preem>;
}

export async function updatePreemAction({
  path,
  preem,
}: UpdatePreemOptions): Promise<{ ok: boolean; error?: string }> {
  try {
    const authUser = await verifyAuthUser();
    await updatePreem(path, preem, authUser);

    return { ok: true };
  } catch (error) {
    console.error('Failed to update preem document:', error);
    const message =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    return { ok: false, error: `Failed to save preem: ${message}` };
  }
}
