import { getRenderablePreemDataForPage } from '@/datastore/firestore';
import Preem from './Preem';

export default async function PreemPage({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}) {
  const data = await getRenderablePreemDataForPage((await searchParams).path);
  return <Preem {...data} />;
}
