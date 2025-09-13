'use server';

import { getDoc } from '@/datastore/server/query/query';
import { SeriesSchema } from '@/datastore/schema';
import { NewEvent } from './NewEvent';
import { newEventAction } from './new-event-action';

export default async function NewEventPage({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}) {
  const path = (await searchParams).path;
  const series = await getDoc(SeriesSchema, path);
  return (
    <NewEvent series={series} newEventAction={newEventAction} path={path} />
  );
}
