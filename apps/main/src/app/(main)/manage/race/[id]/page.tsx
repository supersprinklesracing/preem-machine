import { getRacePageDataWithUsers } from '@/datastore/firestore';
import ManageRace from './ManageRace';

export default async function ManageRacePage({
  params,
}: {
  params: { id: string };
}) {
  const data = await getRacePageDataWithUsers((await params).id);

  if (!data) {
    return <div>Race not found</div>;
  }

  return <ManageRace data={data} />;
}
