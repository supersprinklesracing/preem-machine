import { Metadata } from 'next';

import { Breadcrumbs } from '@/components/Breadcrumbs/Breadcrumbs';
import { CommonLayout } from '@/components/layout/CommonLayout';
import { getDocPathFromSearchParams } from '@/datastore/paths';
import { getRacePageDataWithUsers } from '@/datastore/server/query/query';

import { LiveRace } from './LiveRace';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}): Promise<Metadata> {
  const path = getDocPathFromSearchParams(await searchParams);
  const { race } = await getRacePageDataWithUsers(path);
  return {
    title: race.name,
  };
}

export default async function LiveRacePage({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}) {
  const path = getDocPathFromSearchParams(await searchParams);
  const data = await getRacePageDataWithUsers(path);
  return (
    <CommonLayout breadcrumb={<Breadcrumbs brief={data.race} />}>
      <LiveRace {...data} />
    </CommonLayout>
  );
}
