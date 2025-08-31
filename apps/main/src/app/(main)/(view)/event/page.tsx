import { getRenderableEventDataForPage } from '@/datastore/firestore';
import Event from './Event';

export default async function EventPage({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}) {
  const data = await getRenderableEventDataForPage((await searchParams).path);
  return <Event {...data} />;
}
