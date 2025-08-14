'use server';

import { getUserFromCookies } from '@/app/shared/user';
import { getContributionsForUser, getUserById } from '@/datastore/data-access';
import { notFound, redirect } from 'next/navigation';
import User from './User';

export default async function UserPage({
  params,
}: {
  params: { id: string[] | undefined };
}) {
  const id = params.id?.[0];
  if (!id) {
    const authUser = await getUserFromCookies();
    redirect(authUser ? `/user/${authUser.uid}` : '/login?redirect=/user');
  }

  const user = await getUserById(id);
  if (!user) {
    notFound();
  }
  const contributions = await getContributionsForUser(id);

  return <User user={user} contributions={contributions} />;
}
