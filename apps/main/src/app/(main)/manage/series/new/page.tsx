'use server';

import { getDoc } from '@/datastore/server/query/query';
import { OrganizationSchema } from '@/datastore/schema';
import { getDocPathFromSearchParams } from '@/datastore/paths';
import { NewSeries } from './NewSeries';
import { newSeriesAction } from './new-series-action';

export default async function NewSeriesPage({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}) {
  const path = getDocPathFromSearchParams(await searchParams);
  const organization = await getDoc(OrganizationSchema, path);
  return (
    <NewSeries
      organization={organization}
      newSeriesAction={newSeriesAction}
      path={path}
    />
  );
}
