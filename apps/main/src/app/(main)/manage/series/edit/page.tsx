'use server';

import { Metadata } from 'next';

import { Breadcrumbs } from '@/components/Breadcrumbs/Breadcrumbs';
import { CommonLayout } from '@/components/layout/CommonLayout';
import { getDocPathFromSearchParams } from '@/datastore/paths';
import { SeriesSchema } from '@/datastore/schema';
import { getDoc } from '@/datastore/server/query/query';

import { newEventAction } from '../../event/new/new-event-action';
import { editSeriesAction } from './edit-series-action';
import { EditSeries } from './EditSeries';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}): Promise<Metadata> {
  const path = getDocPathFromSearchParams(await searchParams);
  const { name } = await getDoc(SeriesSchema, path);
  return {
    title: name,
  };
}

export default async function EditSeriesPage({
  searchParams,
}: {
  searchParams: { path: string };
}) {
  const path = getDocPathFromSearchParams(await searchParams);
  const doc = await getDoc(SeriesSchema, path);
  return (
    <CommonLayout breadcrumb={<Breadcrumbs brief={doc} />}>
      <EditSeries
        series={doc}
        editSeriesAction={editSeriesAction}
        newEventAction={newEventAction}
      />
    </CommonLayout>
  );
}
