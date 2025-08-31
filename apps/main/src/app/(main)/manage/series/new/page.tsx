'use server';

import { CreateSeries } from './CreateSeries';
import { createSeriesAction } from './create-series-action';

export default async function CreateSeriesPage({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}) {
  return (
    <CreateSeries
      createSeriesAction={createSeriesAction}
      path={(await searchParams).path}
    />
  );
}
