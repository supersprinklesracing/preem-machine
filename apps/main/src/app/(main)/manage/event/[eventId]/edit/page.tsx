'use server';

import { getEventById } from '@/datastore/firestore';
import { notFound } from 'next/navigation';
import { EditEvent } from './EditEvent';
import { updateEventAction } from './update-event-action';

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const event = await getEventById(eventId);

  if (!event) {
    notFound();
  }

  return <EditEvent event={event} updateEventAction={updateEventAction} />;
}
