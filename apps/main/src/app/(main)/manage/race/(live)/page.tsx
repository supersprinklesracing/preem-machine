import { getRacePageDataWithUsers } from '@/datastore/server/query/query';
import LiveRace from './LiveRace';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Stack } from '@mantine/core';
import { getDocPathFromSearchParams } from '@/datastore/paths';

export default async function LiveRacePage({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}) {
  const path = getDocPathFromSearchParams(await searchParams);
  const data = await getRacePageDataWithUsers(path);
  return (
    <Stack>
      <Breadcrumbs brief={data.race} />
      <LiveRace {...data} />
    </Stack>
  );
}
