import Race from './Race';
import { getRenderableRaceDataForPage } from '@/datastore/firestore';
import { getDocPathFromSearchParams } from '@/datastore/paths';

export default async function RacePage({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}) {
  const path = getDocPathFromSearchParams(await searchParams);
  const data = await getRenderableRaceDataForPage(path);
  return <Race {...data} />;
}
