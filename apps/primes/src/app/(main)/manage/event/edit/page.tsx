'use server';

import { Metadata } from 'next';

import { Breadcrumbs } from '@/components/Breadcrumbs/Breadcrumbs';
import { CommonLayout } from '@/components/layout/CommonLayout';
import { getDocPathFromSearchParams } from '@/datastore/paths';
import { EventSchema } from '@/datastore/schema';
import { getDoc } from '@/datastore/server/query/query';

import { editEventAction } from './edit-event-action';
import { EditEvent } from './EditEvent';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}): Promise<Metadata> {
  const path = getDocPathFromSearchParams(await searchParams);
  const { name } = await getDoc(EventSchema, path);
  return {
    title: name,
  };
}

export default async function EditEventPage({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}) {
  const path = getDocPathFromSearchParams(await searchParams);
  const event = await getDoc(EventSchema, path);
  return (
    <CommonLayout breadcrumb={<Breadcrumbs brief={event} />}>
      <EditEvent event={event} editEventAction={editEventAction} />
    </CommonLayout>
  );
}
