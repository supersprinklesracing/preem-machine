import Race from './Race';
import { getRenderableRaceDataForPage } from '@/datastore/firestore';
import { notFound } from 'next/navigation';

export default async function RacePage({ params }: { params: { id: string } }) {
  const data = await getRenderableRaceDataForPage((await params).id);

  if (!data) {
    notFound();
  }

  return <Race data={data} />;
}
