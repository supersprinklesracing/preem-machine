import { Metadata } from 'next';

import { Breadcrumbs } from '@/components/Breadcrumbs/Breadcrumbs';
import { CommonLayout } from '@/components/layout/CommonLayout';
import { getDocPathFromSearchParams } from '@/datastore/paths';
import { getRenderableSeriesDataForPage } from '@/datastore/server/query/query';

import { Series } from './Series';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}): Promise<Metadata> {
  const path = getDocPathFromSearchParams(await searchParams);
  const { series } = await getRenderableSeriesDataForPage(path);
  return {
    title: series.name,
  };
}

export default async function SeriesPage({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}) {
  const path = getDocPathFromSearchParams(await searchParams);
  const data = await getRenderableSeriesDataForPage(path);
  return (
    <CommonLayout breadcrumb={<Breadcrumbs brief={data.series} />}>
      <Series {...data} />
    </CommonLayout>
  );
}
