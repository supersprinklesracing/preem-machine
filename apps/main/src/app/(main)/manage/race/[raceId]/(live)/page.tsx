import { getRacePageDataWithUsers } from '@/datastore/firestore';
import LiveRace from './LiveRace';

export default async function LiveRacePage({
  params,
}: {
  params: { raceId: string };
}) {
  const data = await getRacePageDataWithUsers((await params).raceId);

  if (!data) {
    return <div>Race not found</div>;
  }

  return <LiveRace data={data} />;
}
