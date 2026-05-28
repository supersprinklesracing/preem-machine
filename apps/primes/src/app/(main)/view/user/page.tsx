'use server';

import { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { Breadcrumbs } from '@/components/Breadcrumbs/Breadcrumbs';
import { CommonLayout } from '@/components/layout/CommonLayout';
import { getDocPathFromSearchParams } from '@/datastore/paths';
import { getRenderableUserDataForPage } from '@/datastore/server/query/query';
import { getUserContext } from '@/user/server/user';

import { User } from './User';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}): Promise<Metadata> {
  const path = getDocPathFromSearchParams(await searchParams);
  const { user } = await getRenderableUserDataForPage(path);
  return {
    title: user.name,
  };
}

export default async function UserPage({
  searchParams,
}: {
  searchParams: Promise<{ path: string | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  if (!resolvedSearchParams.path) {
    const { authUser } = await getUserContext();
    redirect(
      authUser ? `/view/user/${authUser.uid}` : '/login?redirect=/view/user',
    );
  }

  const path = getDocPathFromSearchParams(resolvedSearchParams);
  const data = await getRenderableUserDataForPage(path);
  return (
    <CommonLayout breadcrumb={<Breadcrumbs brief={null} />}>
      <User {...data} />
    </CommonLayout>
  );
}
