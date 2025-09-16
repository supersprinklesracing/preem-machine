'use server';

import { verifyUserContext } from '@/user/server/user';
import Account from './Account';
import { editUserAction } from './edit-user-action';

export default async function AccountPage() {
  const { user } = await verifyUserContext();
  return <Account user={user} editUserAction={editUserAction} />;
}
