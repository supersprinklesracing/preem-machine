'use server';

import { Breadcrumbs } from '@/components/Breadcrumbs';
import { getDoc } from '@/datastore/firestore';
import { Event } from '@/datastore/schema';
import { clientEventConverter } from '@/datastore/zod-converters';
import { Stack } from '@mantine/core';
import { EditEvent } from './EditEvent';
import { editEventAction } from './edit-event-action';

export default async function EditEventPage({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}) {
  const { path } = await searchParams;
  const event = await getDoc<Event>(path, clientEventConverter);
  return (
    <Stack>
      <Breadcrumbs brief={event} />
      <EditEvent event={event} editEventAction={editEventAction} />
    </Stack>
  );
}
