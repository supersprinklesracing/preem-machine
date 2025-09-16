'use server';

import { getUserContext } from '@/user/server/user';
import { redirect } from 'next/navigation';
import { newUserAction } from './new-user-action';
import NewUser from './NewUser';

export default async function NewUserPage() {
  const { authUser, user } = await getUserContext();

  // If the user is not authenticated, redirect to login.
  // This is a safeguard; middleware should typically handle this.
  if (!authUser) {
    redirect('/login');
  }

  // Check if the user document already exists in Firestore, if so redirect them
  // to their account page.
  if (user) {
    redirect('/account');
  }

  // Otherwise, the user needs to register.
  return <NewUser newUserAction={newUserAction} />;
}
