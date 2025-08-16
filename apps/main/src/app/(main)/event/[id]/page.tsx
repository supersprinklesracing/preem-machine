import { getRenderableEventDataForPage } from '@/datastore/firestore';
import { notFound } from 'next/navigation';
import Event from './Event';

export default async function EventPage({
  params,
}: {
  params: { id: string };
}) {
  const data = await getRenderableEventDataForPage(params.id);

  if (!data) {
    notFound();
  }
  return <Event data={data} />;
}
