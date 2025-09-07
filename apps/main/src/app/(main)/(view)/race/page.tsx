import Race from './Race';
import { getRenderableRaceDataForPage } from '@/datastore/firestore';
import { getDocPathFromSearchParams } from '@/datastore/paths';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Stack } from '@mantine/core';

export default async function RacePage({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}) {
  const path = getDocPathFromSearchParams(await searchParams);
  const data = await getRenderableRaceDataForPage(path);
  return (
    <Stack>
      <Breadcrumbs brief={data.race} />
      <Race {...data} />
    </Stack>
  );
}
