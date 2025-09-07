import { Breadcrumbs } from '@/components/Breadcrumbs';
import { getRenderablePreemDataForPage } from '@/datastore/firestore';
import { getDocPathFromSearchParams } from '@/datastore/paths';
import { Stack } from '@mantine/core';
import Preem from './Preem';

export default async function PreemPage({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}) {
  const path = getDocPathFromSearchParams(await searchParams);
  const data = await getRenderablePreemDataForPage(path);
  return (
    <Stack>
      <Breadcrumbs brief={data.preem} />
      <Preem {...data} />
    </Stack>
  );
}
