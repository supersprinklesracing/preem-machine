'use server';

import { getAuthUser } from '@/auth/server/auth';
import { Breadcrumbs } from '@/components/Breadcrumbs/Breadcrumbs';
import { getRenderableUserDataForPage } from '@/datastore/server/query/query';
import { getDocPathFromSearchParams } from '@/datastore/paths';
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
    const authUser = await getAuthUser();
    redirect(
      authUser ? `/user/${authUser.uid}` : '/login?redirect=/user',
    );
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
