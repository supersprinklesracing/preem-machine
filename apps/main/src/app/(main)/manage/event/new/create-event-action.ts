'use server';

import { verifyAuthUser } from '@/auth/user';
import { createEvent } from '@/datastore/create';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { Event } from '@/datastore/types';

const createEventSchema = z.object({
  name: z.string().min(2, 'Name must have at least 2 letters'),
  description: z.string().min(10, 'Description must have at least 10 letters'),
  startDate: z.string(),
  endDate: z.string(),
});

export async function createEventAction(path: string, options: unknown) {
  try {
    const user = await verifyAuthUser();

    const validation = createEventSchema.safeParse(options);

    if (!validation.success) {
      return {
        ok: false,
        error: 'Invalid data.',
      };
    }

    const eventData: Partial<Omit<Event, 'startDate' | 'endDate'>> & {
      startDate?: string;
      endDate?: string;
    } = {
      ...validation.data,
    };

    const newEventSnapshot = await createEvent(path, eventData, user);
    const newEvent = newEventSnapshot.data();
    if (!newEvent) {
      throw new Error('Failed to create event.');
    }
    revalidatePath(path);
    return { ok: true, eventId: newEvent.id };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : 'An unknown error occurred.';
    return {
      ok: false,
      error: message,
    };
  }
}
