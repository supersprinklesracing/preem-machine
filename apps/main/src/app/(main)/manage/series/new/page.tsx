'use server';

import { getCollectionPathFromSearchParams } from '@/datastore/paths';
import { NewSeries } from './NewSeries';
import { newSeriesAction } from './new-series-action';

export default async function NewSeriesPage({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}) {
  return (
    <NewSeries
      newSeriesAction={newSeriesAction}
      path={getCollectionPathFromSearchParams(await searchParams)}
    />
  );
}
