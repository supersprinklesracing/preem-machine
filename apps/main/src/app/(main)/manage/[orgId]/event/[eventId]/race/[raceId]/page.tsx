import { getRacePageDataWithUsers } from '@/datastore/firestore';
import ManageRace from './ManageRace';

export default async function ManageRacePage({
  params,
}: {
  params: { raceId: string; eventId: string; orgId: string };
}) {
  const data = await getRacePageDataWithUsers((await params).raceId);

  if (!data) {
    return <div>Race not found</div>;
  }

  return <ManageRace data={data} />;
}
