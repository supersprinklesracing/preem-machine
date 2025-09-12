import { getRenderableSeriesDataForPage } from '@/datastore/server/query/query';
import LiveSeries from './LiveSeries';
import { Breadcrumbs } from '@/components/Breadcrumbs/Breadcrumbs';
import { Stack } from '@mantine/core';
import { getDocPathFromSearchParams } from '@/datastore/paths';

export default async function LiveSeriesPage({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}) {
  const path = getDocPathFromSearchParams(await searchParams);
  const data = await getRenderableSeriesDataForPage(path);
  return (
    <Stack>
      <Breadcrumbs brief={data.series} />
      <LiveSeries {...data} />
    </Stack>
  );
}
