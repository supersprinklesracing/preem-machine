'use server';

import { Breadcrumbs } from '@/components/Breadcrumbs/Breadcrumbs';
import { getDoc } from '@/datastore/server/query/query';
import { Event } from '@/datastore/schema';
import { Stack } from '@mantine/core';
import { EditEvent } from './EditEvent';
import { editEventAction } from './edit-event-action';

export default async function EditEventPage({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}) {
  const { path } = await searchParams;
  const event = await getDoc<Event>(path);
  return (
    <Stack>
      <Breadcrumbs brief={event} />
      <EditEvent event={event} editEventAction={editEventAction} />
    </Stack>
  );
}
