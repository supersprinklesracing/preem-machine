import LiveEvent from './LiveEvent';
import { getRenderableEventDataForPage } from '@/datastore/firestore';
import { notFound } from 'next/navigation';

export default async function LiveEventPage({
  params,
}: {
  params: { eventId: string };
}) {
  const data = await getRenderableEventDataForPage((await params).eventId);

  if (!data) {
    notFound();
  }
  return <LiveEvent data={data} />;
}
