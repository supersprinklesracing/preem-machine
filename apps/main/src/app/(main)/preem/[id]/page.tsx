import { getRenderablePreemDataForPage } from '@/datastore/firestore';
import { notFound } from 'next/navigation';
import Preem from './Preem';

export default async function PreemPage({
  params,
}: {
  params: { id: string };
}) {
  const data = await getRenderablePreemDataForPage((await params).id);

  if (!data) {
    notFound();
  }

  return <Preem data={data} />;
}
