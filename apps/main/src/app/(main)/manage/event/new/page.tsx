'use server';

import { NewEvent } from './NewEvent';
import { newEventAction } from './new-event-action';

export default async function NewEventPage({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}) {
  return (
    <NewEvent
      newEventAction={newEventAction}
      path={(await searchParams).path}
    />
  );
}
