import { getRenderableEventDataForPage } from '@/datastore/firestore';
import LiveEvent from './LiveEvent';

export default async function LiveEventPage({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}) {
  const data = await getRenderableEventDataForPage((await searchParams).path);
  return <LiveEvent {...data} />;
}
