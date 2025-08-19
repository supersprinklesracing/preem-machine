'use server';

import { getAuthUserFromCookies } from '@/auth/user';
import type { Series } from '@/datastore/types';
import { getFirestore } from '@/firebase-admin/firebase-admin';

export interface UpdateSeriesOptions {
  series?: Partial<Series>;
}

export async function updateSeriesAction(
  seriesId: string,
  updateSeries: UpdateSeriesOptions
): Promise<{ ok: boolean; error?: string }> {
  try {
    const authUser = await getAuthUserFromCookies();
    if (!authUser) {
      return { ok: false, error: 'Authentication required.' };
    }

    if (updateSeries.series) {
      const db = await getFirestore();
      // Note: This assumes a top-level 'series' collection.
      // You may need to adjust the collection path based on your Firestore structure.
      const seriesRef = db.collection('series').doc(seriesId);
      const seriesDoc = await seriesRef.get();

      if (!seriesDoc.exists) {
        return { ok: false, error: 'Series does not exist.' };
      }

      await seriesRef.update(updateSeries.series);
    }

    return { ok: true };
  } catch (error) {
    console.error('Failed to update series document:', error);
    const message =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    return { ok: false, error: `Failed to save series: ${message}` };
  }
}
