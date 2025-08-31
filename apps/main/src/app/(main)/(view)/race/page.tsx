import Race from './Race';
import { getRenderableRaceDataForPage } from '@/datastore/firestore';

export default async function RacePage({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}) {
  const data = await getRenderableRaceDataForPage((await searchParams).path);
  return <Race {...data} />;
}
