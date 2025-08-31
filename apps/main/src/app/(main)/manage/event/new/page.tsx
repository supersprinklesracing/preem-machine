'use server';

import { CreateEvent } from './CreateEvent';
import { createEventAction } from './create-event-action';

export default async function CreateEventPage({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}) {
  return (
    <CreateEvent
      createEventAction={createEventAction}
      path={(await searchParams).path}
    />
  );
}
