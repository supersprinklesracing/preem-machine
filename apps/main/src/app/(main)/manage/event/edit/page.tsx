'use server';

import { Breadcrumbs } from '@/components/Breadcrumbs/Breadcrumbs';
import { getDocPathFromSearchParams } from '@/datastore/paths';
import { EventSchema } from '@/datastore/schema';
import { getDoc } from '@/datastore/server/query/query';
import { Stack } from '@mantine/core';
import { EditEvent } from './EditEvent';
import { editEventAction } from './edit-event-action';

export default async function EditEventPage({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}) {
  const path = getDocPathFromSearchParams(await searchParams);
  const event = await getDoc(EventSchema, path);
  return (
    <Stack>
      <Breadcrumbs brief={event} />
      <EditEvent event={event} editEventAction={editEventAction} />
    </Stack>
  );
}
