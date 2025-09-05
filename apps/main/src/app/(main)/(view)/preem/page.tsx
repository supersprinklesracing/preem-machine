import { getRenderablePreemDataForPage } from '@/datastore/firestore';
import { getDocPathFromSearchParams } from '@/datastore/paths';
import Preem from './Preem';

export default async function PreemPage({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}) {
  const path = getDocPathFromSearchParams(await searchParams);
  const data = await getRenderablePreemDataForPage(path);
  return <Preem {...data} />;
}
