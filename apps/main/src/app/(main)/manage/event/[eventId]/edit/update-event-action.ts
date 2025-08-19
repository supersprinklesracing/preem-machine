'use server';

import { getAuthUserFromCookies } from '@/auth/user';
import type { Event } from '@/datastore/types';
import { getFirestore } from '@/firebase-admin/firebase-admin';

export interface UpdateEventOptions {
  event?: Partial<Event>;
}

export async function updateEventAction(
  eventId: string,
  updateEvent: UpdateEventOptions
): Promise<{ ok: boolean; error?: string }> {
  try {
    const authUser = await getAuthUserFromCookies();
    if (!authUser) {
      return { ok: false, error: 'Authentication required.' };
    }

    if (updateEvent.event) {
      const db = await getFirestore();
      // Note: This assumes a top-level 'events' collection.
      // You may need to adjust the collection path based on your Firestore structure.
      const eventRef = db.collection('events').doc(eventId);
      const eventDoc = await eventRef.get();

      if (!eventDoc.exists) {
        return { ok: false, error: 'Event does not exist.' };
      }

      await eventRef.update(updateEvent.event);
    }

    return { ok: true };
  } catch (error) {
    console.error('Failed to update event document:', error);
    const message =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    return { ok: false, error: `Failed to save event: ${message}` };
  }
}
