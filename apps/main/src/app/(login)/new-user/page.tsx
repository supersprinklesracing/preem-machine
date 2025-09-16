'use server';

import { getAuthUser } from '@/auth/server/auth';
import { redirect } from 'next/navigation';
import { newUserAction } from './new-user-action';
import NewUser from './NewUser';
import { getUser } from '@/user/server/user';

export default async function NewUserPage() {
  const authUser = await getAuthUser();

  // If the user is not authenticated, redirect to login.
  // This is a safeguard; middleware should typically handle this.
  if (!authUser) {
    redirect('/login');
  }

  // Check if the user document already exists in Firestore, if so redirect them.
  const exists = await getUser();
  if (exists) {
    redirect('/login');
  }

  // Otherwise, the user needs to register.
  return <NewUser newUserAction={newUserAction} />;
}
