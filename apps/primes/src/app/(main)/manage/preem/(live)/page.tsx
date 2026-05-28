import { Metadata } from 'next';

import { Breadcrumbs } from '@/components/Breadcrumbs/Breadcrumbs';
import { CommonLayout } from '@/components/layout/CommonLayout';
import { getDocPathFromSearchParams } from '@/datastore/paths';
import { getPreemPageDataWithUsers } from '@/datastore/server/query/query';

import { LivePreem } from './LivePreem';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}): Promise<Metadata> {
  const path = getDocPathFromSearchParams(await searchParams);
  const { preem } = await getPreemPageDataWithUsers(path);
  return {
    title: preem.name,
  };
}

export default async function LivePreemPage({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}) {
  const path = getDocPathFromSearchParams(await searchParams);
  const data = await getPreemPageDataWithUsers(path);
  return (
    <CommonLayout breadcrumb={<Breadcrumbs brief={data.preem} />}>
      <LivePreem {...data} />
    </CommonLayout>
  );
}
