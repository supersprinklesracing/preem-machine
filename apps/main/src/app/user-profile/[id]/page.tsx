import { getContributionsForUser, getUserById } from '@/datastore/data-access';
import UserProfile from './UserProfile';

export default async function UserProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getUserById(params.id);
  const contributions = await getContributionsForUser(params.id);

  if (!user) {
    return <div>User not found</div>;
  }

  return <UserProfile user={user} contributions={contributions} />;
}
