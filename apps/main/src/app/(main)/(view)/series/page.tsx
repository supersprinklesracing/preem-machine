import { getRenderableSeriesDataForPage } from '@/datastore/firestore';
import { getDocPathFromSearchParams } from '@/datastore/paths';
import Series from './Series';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Stack } from '@mantine/core';

export default async function SeriesPage({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}) {
  const path = getDocPathFromSearchParams(await searchParams);
  const data = await getRenderableSeriesDataForPage(path);
  return (
    <Stack>
      <Breadcrumbs brief={data.series} />
      <Series {...data} />
    </Stack>
  );
}
