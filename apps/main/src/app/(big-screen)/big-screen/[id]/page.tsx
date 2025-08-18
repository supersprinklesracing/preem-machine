import { getRenderableRaceDataForPage, getUsers } from '@/datastore/firestore';
import BigScreen from './BigScreen';

export default async function BigScreenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const data = await getRenderableRaceDataForPage((await params).id);
  const users = await getUsers();

  if (!data) {
    return <div>Race not found</div>;
  }

  return <BigScreen data={data} users={users} />;
}
