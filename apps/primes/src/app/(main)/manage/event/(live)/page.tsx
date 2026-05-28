import { Metadata } from 'next';

import { Breadcrumbs } from '@/components/Breadcrumbs/Breadcrumbs';
import { CommonLayout } from '@/components/layout/CommonLayout';
import { getDocPathFromSearchParams } from '@/datastore/paths';
import { getRenderableEventDataForPage } from '@/datastore/server/query/query';

import { LiveEvent } from './LiveEvent';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}): Promise<Metadata> {
  const path = getDocPathFromSearchParams(await searchParams);
  const { event } = await getRenderableEventDataForPage(path);
  return {
    title: event.name,
  };
}

export default async function LiveEventPage({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}) {
  const path = getDocPathFromSearchParams(await searchParams);
  const data = await getRenderableEventDataForPage(path);
  return (
    <CommonLayout breadcrumb={<Breadcrumbs brief={data.event} />}>
      <LiveEvent {...data} />
    </CommonLayout>
  );
}
