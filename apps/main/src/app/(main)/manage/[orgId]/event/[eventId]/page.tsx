import ManageEvent from './ManageEvent';
import { getRenderableEventDataForPage } from '@/datastore/firestore';
import { notFound } from 'next/navigation';

export default async function ManageEventPage({
  params,
}: {
  params: { orgId: string; eventId: string };
}) {
  const data = await getRenderableEventDataForPage((await params).eventId);

  if (!data) {
    notFound();
  }
  return <ManageEvent data={data} />;
}
