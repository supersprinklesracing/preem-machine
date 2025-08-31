'use server';

import { getAuthUserFromCookies } from '@/auth/user';
import { getRenderableUserDataForPage } from '@/datastore/firestore';
import { getDocPathFromSearchParams } from '@/datastore/paths';
import { redirect } from 'next/navigation';
import User from './User';

export default async function UserPage({
  searchParams,
}: {
  searchParams: Promise<{ path: string | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  if (!resolvedSearchParams.path) {
    const authUser = await getAuthUserFromCookies();
    redirect(
      authUser ? `/user?path=users/${authUser.uid}` : '/login?redirect=/user',
    );
  }

  const path = getDocPathFromSearchParams(resolvedSearchParams);
  const data = await getRenderableUserDataForPage(path);
  return <User {...data} />;
}
