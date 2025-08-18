import { getRenderableEventDataForPage } from '@/datastore/firestore';
import { notFound } from 'next/navigation';
import Event from './Event';

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const data = await getRenderableEventDataForPage((await params).id);

  if (!data) {
    notFound();
  }
  return <Event data={data} />;
}
