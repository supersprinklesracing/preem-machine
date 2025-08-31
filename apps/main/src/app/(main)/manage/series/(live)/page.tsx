import { getRenderableSeriesDataForPage } from '@/datastore/firestore';
import LiveSeries from './LiveSeries';

export default async function LiveSeriesPage({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}) {
  const data = await getRenderableSeriesDataForPage((await searchParams).path);
  return <LiveSeries {...data} />;
}
