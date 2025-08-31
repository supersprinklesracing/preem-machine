'use server';

import { verifyAuthUser } from '@/auth/user';
import { FormActionError, FormActionResult } from '@/components/forms/forms';
import { createEvent } from '@/datastore/create';
import type { Event } from '@/datastore/types';
import { DocPath } from '@/datastore/paths';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const newEventSchema = z.object({
  name: z.string().min(2, 'Name must have at least 2 letters'),
  description: z.string().min(10, 'Description must have at least 10 letters'),
  startDate: z.string(),
  endDate: z.string(),
});

export async function newEventAction(
  path: string,
  options: unknown,
): Promise<FormActionResult<{ path: DocPath }>> {
  try {
    const user = await verifyAuthUser();

    const validation = newEventSchema.safeParse(options);

    if (!validation.success) {
      throw new FormActionError('Invalid data.');
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
    return { path: newEvent.path };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : 'An unknown error occurred.';
    throw new FormActionError(message);
  }
}
