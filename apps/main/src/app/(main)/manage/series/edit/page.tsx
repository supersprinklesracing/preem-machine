'use server';

import { getDoc } from '@/datastore/firestore';
import { Series } from '@/datastore/types';
import { newEventAction } from '../../event/new/new-event-action';
import { EditSeries } from './EditSeries';
import { editSeriesAction } from './edit-series-action';

export default async function EditSeriesPage({
  searchParams,
}: {
  searchParams: { path: string };
}) {
  const { path } = searchParams;
  const doc = await getDoc<Series>(path);
  return (
    <EditSeries
      series={doc}
      editSeriesAction={editSeriesAction}
      newEventAction={newEventAction}
    />
  );
}
