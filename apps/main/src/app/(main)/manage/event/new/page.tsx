'use server';

import { Metadata } from 'next';

import { Breadcrumbs } from '@/components/Breadcrumbs/Breadcrumbs';
import { CommonLayout } from '@/components/layout/CommonLayout';
import {
  getCollectionPathFromSearchParams,
  getParentPath,
} from '@/datastore/paths';
import { SeriesSchema } from '@/datastore/schema';
import { getDoc } from '@/datastore/server/query/query';

import { newEventAction } from './new-event-action';
import { NewEvent } from './NewEvent';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'New Event',
  };
}

export default async function NewEventPage({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}) {
  const path = getCollectionPathFromSearchParams(await searchParams);
  const series = await getDoc(SeriesSchema, getParentPath(path));
  return (
    <CommonLayout breadcrumb={<Breadcrumbs brief={series} />}>
      <NewEvent series={series} newEventAction={newEventAction} path={path} />
    </CommonLayout>
  );
}
