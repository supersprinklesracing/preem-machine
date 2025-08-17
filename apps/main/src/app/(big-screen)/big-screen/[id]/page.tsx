import BigScreen from './BigScreen';
import { getRacePageDataWithUsers } from '@/datastore/firestore';

export default async function BigScreenPage({
  params,
}: {
  params: { id: string };
}) {
  const data = await getRacePageDataWithUsers((await params).id);

  if (!data) {
    return <div>Race not found</div>;
  }

  return <BigScreen initialRace={data.race} users={data.users} />;
}
