'use server';

import { getEventById } from '@/datastore/firestore';
import { notFound } from 'next/navigation';
import { EditEvent } from './EditEvent';
import { updateEventAction } from './update-event-action';

export default async function EditEventPage({
  params,
}: {
  params: { eventId: string };
}) {
  const event = await getEventById(params.eventId);

  if (!event) {
    notFound();
  }

  const boundUpdateEventAction = updateEventAction.bind(null, params.eventId);

  return <EditEvent event={event} updateEventAction={boundUpdateEventAction} />;
}
