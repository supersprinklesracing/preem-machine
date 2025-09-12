'use server';

import { Breadcrumbs } from '@/components/Breadcrumbs/Breadcrumbs';
import { getRenderableHomeDataForPage } from '@/datastore/server/query/query';
import { Stack } from '@mantine/core';
import Home from './Home';

export default async function Page() {
  const data = await getRenderableHomeDataForPage();
  return (
    <Stack>
      <Breadcrumbs brief={null} />
      <Home {...data} />
    </Stack>
  );
}
