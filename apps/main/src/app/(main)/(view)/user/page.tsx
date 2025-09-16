'use server';

import { Breadcrumbs } from '@/components/Breadcrumbs/Breadcrumbs';
import { getDocPathFromSearchParams } from '@/datastore/paths';
import { getRenderableUserDataForPage } from '@/datastore/server/query/query';
import { getUserContext } from '@/user/server/user';
import { Stack } from '@mantine/core';
import { redirect } from 'next/navigation';
import User from './User';

export default async function UserPage({
  searchParams,
}: {
  searchParams: Promise<{ path: string | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  if (!resolvedSearchParams.path) {
    const { authUser } = await getUserContext();
    redirect(authUser ? `/user/${authUser.uid}` : '/login?redirect=/user');
  }

  const path = getDocPathFromSearchParams(resolvedSearchParams);
  const data = await getRenderableUserDataForPage(path);
  return (
    <Stack>
      <Breadcrumbs brief={null} />
      <User {...data} />
    </Stack>
  );
}
