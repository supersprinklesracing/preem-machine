import { getContributionsForUser, getUserById } from '@/datastore/data-access';
import User from './User';

export default async function UserPage({ params }: { params: { id: string } }) {
  const user = await getUserById((await params).id);
  const contributions = await getContributionsForUser(params.id);

  if (!user) {
    return <div>User not found</div>;
  }

  return <User user={user} contributions={contributions} />;
}
