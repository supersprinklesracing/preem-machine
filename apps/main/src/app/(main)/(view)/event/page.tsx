import { getRenderableEventDataForPage } from '@/datastore/firestore';
import { getDocPathFromSearchParams } from '@/datastore/paths';
import Event from './Event';

export default async function EventPage({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}) {
  const path = getDocPathFromSearchParams(await searchParams);
  const data = await getRenderableEventDataForPage(path);
  return <Event {...data} />;
}
