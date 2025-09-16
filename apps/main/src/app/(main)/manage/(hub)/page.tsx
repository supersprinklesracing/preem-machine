import { Breadcrumbs } from '@/components/Breadcrumbs/Breadcrumbs';
import { Stack } from '@mantine/core';
import { getHubPageData } from './hub-data';
import Hub from './Hub';

export default async function LiveOrganizationPage() {
  const data = await getHubPageData();

  return (
    <Stack>
      <Breadcrumbs brief={null} />
      <Hub {...data} />
    </Stack>
  );
}
