'use server';

import { getDoc } from '@/datastore/firestore';
import { EditSeries } from './EditSeries';
import { updateSeriesAction } from './update-series-action';
import { Series } from '@/datastore/types';

export default async function EditSeriesPage({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}) {
  const { path } = await searchParams;
  const doc = await getDoc<Series>(path);
  return <EditSeries series={doc} updateSeriesAction={updateSeriesAction} />;
}
