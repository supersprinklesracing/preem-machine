'use server';

import { getSeriesById } from '@/datastore/firestore';
import { notFound } from 'next/navigation';
import { EditSeries } from './EditSeries';
import { updateSeriesAction } from './update-series-action';

export default async function EditSeriesPage({
  params,
}: {
  params: { seriesId: string };
}) {
  const series = await getSeriesById(params.seriesId);

  if (!series) {
    notFound();
  }

  const boundUpdateSeriesAction = updateSeriesAction.bind(
    null,
    params.seriesId
  );

  return (
    <EditSeries series={series} updateSeriesAction={boundUpdateSeriesAction} />
  );
}
