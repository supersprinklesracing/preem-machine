import Event from './Event';
import { getRenderableEventDataForPage } from '@/datastore/firestore';
import { notFound } from 'next/navigation';

export default async function EventPage({
  params,
}: {
  params: { orgId: string; eventId: string };
}) {
  const data = await getRenderableEventDataForPage((await params).eventId);

  if (!data) {
    notFound();
  }
  return <Event data={data} />;
}
