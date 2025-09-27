'use server';

import { Breadcrumbs } from '@/components/Breadcrumbs/Breadcrumbs';
import { getDocPathFromSearchParams } from '@/datastore/paths';
import { SeriesSchema } from '@/datastore/schema';
import { getDoc } from '@/datastore/server/query/query';
import { Stack } from '@mantine/core';
import { newEventAction } from '../../event/new/new-event-action';
import { EditSeries } from './EditSeries';
import { editSeriesAction } from './edit-series-action';

export default async function EditSeriesPage({
  searchParams,
}: {
  searchParams: { path: string };
}) {
  const path = getDocPathFromSearchParams(await searchParams);
  const doc = await getDoc(SeriesSchema, path);
  return (
    <Stack>
      <Breadcrumbs brief={doc} />
      <EditSeries
        series={doc}
        editSeriesAction={editSeriesAction}
        newEventAction={newEventAction}
      />
    </Stack>
  );
}
