'use server';

import { getDoc } from '@/datastore/firestore';
import { Event } from '@/datastore/types';
import { EditEvent } from './EditEvent';
import { updateEventAction } from './update-event-action';

export default async function EditEventPage({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}) {
  const { path } = await searchParams;
  const event = await getDoc<Event>(path);
  return <EditEvent event={event} updateEventAction={updateEventAction} />;
}
