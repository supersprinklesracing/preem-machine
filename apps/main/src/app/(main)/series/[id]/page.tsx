import { getRenderableSeriesDataForPage } from '@/datastore/firestore';
import { notFound } from 'next/navigation';
import Series from './Series';

export default async function SeriesPage({
  params,
}: {
  params: { id: string };
}) {
  const data = await getRenderableSeriesDataForPage(params.id);

  if (!data) {
    notFound();
  }
  return <Series data={data} />;
}
