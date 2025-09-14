import { getPreemPageDataWithUsers } from '@/datastore/server/query/query';
import LivePreem from './LivePreem';
import { Breadcrumbs } from '@/components/Breadcrumbs/Breadcrumbs';
import { Stack } from '@mantine/core';
import { getDocPathFromSearchParams } from '@/datastore/paths';

export default async function LivePreemPage({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}) {
  const path = getDocPathFromSearchParams(await searchParams);
  const data = await getPreemPageDataWithUsers(path);
  return (
    <Stack>
      <Breadcrumbs brief={data.preem} />
      <LivePreem {...data} />
    </Stack>
  );
}
