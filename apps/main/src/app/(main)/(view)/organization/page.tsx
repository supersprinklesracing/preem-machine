import { getRenderableOrganizationDataForPage } from '@/datastore/server/query/query';
import { getDocPathFromSearchParams } from '@/datastore/paths';
import Organization from './Organization';
import { Breadcrumbs } from '@/components/Breadcrumbs/Breadcrumbs';
import { Stack } from '@mantine/core';

export default async function OrganizationPage({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}) {
  const path = getDocPathFromSearchParams(await searchParams);
  const data = await getRenderableOrganizationDataForPage(path);
  return (
    <Stack>
      <Breadcrumbs brief={data.organization} />
      <Organization {...data} />
    </Stack>
  );
}
