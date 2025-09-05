import { getRacePageDataWithUsers } from '@/datastore/firestore';
import LiveRace from './LiveRace';

export default async function LiveRacePage({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}) {
  const { path } = await searchParams;
  const data = await getRacePageDataWithUsers(path);
  return <LiveRace {...data} />;
}
