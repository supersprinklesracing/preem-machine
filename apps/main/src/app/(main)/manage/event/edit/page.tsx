'use server';

import { getDoc } from '@/datastore/firestore';
import { Event } from '@/datastore/types';
import { EditEvent } from './EditEvent';
import { editEventAction } from './edit-event-action';

export default async function EditEventPage({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}) {
  const { path } = await searchParams;
  const event = await getDoc<Event>(path);
  return <EditEvent event={event} editEventAction={editEventAction} />;
}
