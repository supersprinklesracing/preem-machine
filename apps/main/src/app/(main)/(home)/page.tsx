'use server';

import { Breadcrumbs } from '@/components/Breadcrumbs';
import { getRenderableHomeDataForPage } from '@/datastore/firestore';
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
