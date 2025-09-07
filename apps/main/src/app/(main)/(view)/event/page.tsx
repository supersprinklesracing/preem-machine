import { getRenderableEventDataForPage } from '@/datastore/firestore';
import { getDocPathFromSearchParams } from '@/datastore/paths';
import Event from './Event';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Stack } from '@mantine/core';

export default async function EventPage({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}) {
  const path = getDocPathFromSearchParams(await searchParams);
  const data = await getRenderableEventDataForPage(path);
  return (
    <Stack>
      <Breadcrumbs brief={data.event} />
      <Event {...data} />
    </Stack>
  );
}
