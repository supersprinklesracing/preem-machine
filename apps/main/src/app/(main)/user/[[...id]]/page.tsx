'use server';

import { getUserFromCookies } from '@/auth/user';
import { getRenderableUserDataForPage } from '@/datastore/firestore';
import { notFound, redirect } from 'next/navigation';
import User from './User';

export default async function UserPage({
  params,
}: {
  params: { id: string[] | undefined };
}) {
  const id = (await params).id?.[0];
  if (!id) {
    const authUser = await getUserFromCookies();
    redirect(authUser ? `/user/${authUser.uid}` : '/login?redirect=/user');
  }

  const data = await getRenderableUserDataForPage(id);
  if (!data) {
    notFound();
  }

  return <User data={data} />;
}
