import { Metadata } from 'next';

import { Breadcrumbs } from '@/components/Breadcrumbs/Breadcrumbs';
import { CommonLayout } from '@/components/layout/CommonLayout';
import { getDocPathFromSearchParams } from '@/datastore/paths';
import { getRenderablePreemDataForPage } from '@/datastore/server/query/query';

import { Preem } from './Preem';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}): Promise<Metadata> {
  const path = getDocPathFromSearchParams(await searchParams);
  const { preem } = await getRenderablePreemDataForPage(path);
  return {
    title: preem.name,
  };
}

export default async function PreemPage({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}) {
  const path = getDocPathFromSearchParams(await searchParams);
  const data = await getRenderablePreemDataForPage(path);
  return (
    <CommonLayout breadcrumb={<Breadcrumbs brief={data.preem} />}>
      <Preem {...data} />
    </CommonLayout>
  );
}
