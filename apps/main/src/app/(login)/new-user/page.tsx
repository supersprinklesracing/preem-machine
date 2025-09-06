'use server';

import { getAuthUser } from '@/auth/user';
import { getUserById } from '@/datastore/firestore';
import { redirect } from 'next/navigation';
import { newUserAction } from './new-user-action';
import NewUser from './NewUser';

export default async function NewUserPage() {
  const authUser = await getAuthUser();

  // If the user is not authenticated, redirect to login.
  // This is a safeguard; middleware should typically handle this.
  if (!authUser) {
    redirect('/login');
  }

  // Check if the user document already exists in Firestore.
  const currentUser = await getUserById(authUser.uid);

  // If the user document exists, they don't need to complete a new profile.
  if (currentUser) {
    redirect('/');
  }

  // If no user document exists, render the profile creation form.
  return <NewUser newUserAction={newUserAction} />;
}
