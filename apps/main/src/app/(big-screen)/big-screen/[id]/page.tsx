import { getRenderableRaceDataForPage, getUsers } from '@/datastore/firestore';
import BigScreen from './BigScreen';

export default async function BigScreenPage({
  params,
}: {
  params: { id: string };
}) {
  const data = await getRenderableRaceDataForPage(params.id);
  const users = await getUsers();

  if (!data) {
    return <div>Race not found</div>;
  }

  return <BigScreen key={data.race.id} data={data} users={users} />;
}