'use server';

import { getSeriesById } from '@/datastore/firestore';
import { notFound } from 'next/navigation';
import { EditSeries } from './EditSeries';
import { updateSeriesAction } from './update-series-action';

export default async function EditSeriesPage({
  params,
}: {
  params: Promise<{ seriesId: string }>;
}) {
  const { seriesId } = await params;
  const series = await getSeriesById(seriesId);

  if (!series) {
    notFound();
  }

  const plainSeries = JSON.parse(JSON.stringify(series));

  return (
    <EditSeries series={plainSeries} updateSeriesAction={updateSeriesAction} />
  );
}
