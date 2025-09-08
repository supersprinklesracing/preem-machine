import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Stack } from '@mantine/core';
import Account from './Account';
import { editUserAction } from './edit-user-action';
import { verifyAuthUser } from '@/auth/user';
import { getUserById } from '@/datastore/firestore';

export default async function AccountPage() {
  const authUser = await verifyAuthUser();
  const currentUser = await getUserById(authUser.uid);
  if (!currentUser) {
    // This should not happen for an authenticated user who has completed registration,
    // but it's a good safeguard.
    throw new Error('User data not found.');
  }

  return (
    <Stack>
      <Breadcrumbs brief={null} />
      <Account currentUser={currentUser} editUserAction={editUserAction} />
    </Stack>
  );
}
