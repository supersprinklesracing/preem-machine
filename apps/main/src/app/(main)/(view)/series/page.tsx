import { getRenderableSeriesDataForPage } from '@/datastore/firestore';
import Series from './Series';

export default async function SeriesPage({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}) {
  const data = await getRenderableSeriesDataForPage((await searchParams).path);
  return <Series {...data} />;
}
