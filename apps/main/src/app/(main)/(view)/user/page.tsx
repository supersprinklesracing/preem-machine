'use server';

import { getAuthUserFromCookies } from '@/auth/user';
import { getRenderableUserDataForPage } from '@/datastore/firestore';
import { redirect } from 'next/navigation';
import User from './User';

export default async function UserPage({
  searchParams,
}: {
  searchParams: Promise<{ path: string | undefined }>;
}) {
  const path = (await searchParams).path;
  if (!path) {
    const authUser = await getAuthUserFromCookies();
    redirect(
      authUser ? `/user?path=users/${authUser.uid}` : '/login?redirect=/user',
    );
  }

  const data = await getRenderableUserDataForPage(path);
  return <User {...data} />;
}
