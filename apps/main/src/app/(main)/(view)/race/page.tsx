import { Metadata } from 'next';

import { Breadcrumbs } from '@/components/Breadcrumbs/Breadcrumbs';
import { CommonLayout } from '@/components/layout/CommonLayout';
import { getDocPathFromSearchParams } from '@/datastore/paths';
import { getRenderableRaceDataForPage } from '@/datastore/server/query/query';

import { Race } from './Race';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}): Promise<Metadata> {
  const path = getDocPathFromSearchParams(await searchParams);
  const { race } = await getRenderableRaceDataForPage(path);
  return {
    title: race.name,
  };
}

export default async function RacePage({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}) {
  const path = getDocPathFromSearchParams(await searchParams);
  const data = await getRenderableRaceDataForPage(path);
  return (
    <CommonLayout breadcrumb={<Breadcrumbs brief={data.race} />}>
      <Race {...data} />
    </CommonLayout>
  );
}
