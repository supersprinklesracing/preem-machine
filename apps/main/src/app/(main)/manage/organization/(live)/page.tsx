import { getRenderableOrganizationDataForPage } from '@/datastore/server/query/query';
import LiveOrganization from './LiveOrganization';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Stack } from '@mantine/core';
import { getDocPathFromSearchParams } from '@/datastore/paths';

export default async function LiveOrganizationPage({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}) {
  const path = getDocPathFromSearchParams(await searchParams);
  const data = await getRenderableOrganizationDataForPage(path);
  return (
    <Stack>
      <Breadcrumbs brief={data.organization} />
      <LiveOrganization {...data} />
    </Stack>
  );
}
