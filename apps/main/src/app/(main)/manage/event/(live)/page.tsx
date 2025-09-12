import { getRenderableEventDataForPage } from '@/datastore/server/query/query';
import LiveEvent from './LiveEvent';
import { Breadcrumbs } from '@/components/Breadcrumbs/Breadcrumbs';
import { Stack } from '@mantine/core';
import { getDocPathFromSearchParams } from '@/datastore/paths';

export default async function LiveEventPage({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}) {
  const path = getDocPathFromSearchParams(await searchParams);
  const data = await getRenderableEventDataForPage(path);
  return (
    <Stack>
      <Breadcrumbs brief={data.event} />
      <LiveEvent {...data} />
    </Stack>
  );
}
