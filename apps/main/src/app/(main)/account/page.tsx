import Account from './Account';
import { editUserAction } from './edit-user-action';
import { verifyAuthUser } from '@/auth/server/auth';
import { getUserById } from '@/datastore/server/query/query';

export default async function AccountPage() {
  const authUser = await verifyAuthUser();
  const currentUser = await getUserById(authUser.uid);
  if (!currentUser) {
    // This should not happen for an authenticated user who has completed registration,
    // but it's a good safeguard.
    throw new Error('User data not found.');
  }

  return <Account currentUser={currentUser} editUserAction={editUserAction} />;
}
