'use server';

import { Breadcrumbs } from '@/components/Breadcrumbs/Breadcrumbs';
import { getDoc } from '@/datastore/server/query/query';
import { EventSchema } from '@/datastore/schema';
import { Stack } from '@mantine/core';
import { EditEvent } from './EditEvent';
import { editEventAction } from './edit-event-action';

export default async function EditEventPage({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}) {
  const { path } = await searchParams;
  const event = await getDoc(EventSchema, path);
  return (
    <Stack>
      <Breadcrumbs brief={event} />
      <EditEvent event={event} editEventAction={editEventAction} />
    </Stack>
  );
}
