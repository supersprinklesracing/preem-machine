'use server';

import { Breadcrumbs } from '@/components/Breadcrumbs/Breadcrumbs';
import {
  getCollectionPathFromSearchParams,
  getParentPath,
} from '@/datastore/paths';
import { SeriesSchema } from '@/datastore/schema';
import { getDoc } from '@/datastore/server/query/query';
import { Stack } from '@mantine/core';
import { NewEvent } from './NewEvent';
import { newEventAction } from './new-event-action';

export default async function NewEventPage({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}) {
  const path = getCollectionPathFromSearchParams(await searchParams);
  const series = await getDoc(SeriesSchema, getParentPath(path));
  return (
    <Stack>
      <Breadcrumbs brief={series} />
      <NewEvent series={series} newEventAction={newEventAction} path={path} />
    </Stack>
  );
}
