'use server';

import { getContributionsForUser, getUserById } from '@/datastore/data-access';
import User from './User';
import { redirect } from 'next/navigation';
import { getTokens } from 'next-firebase-auth-edge/lib/next/tokens';
import { cookies, headers } from 'next/headers';
import { authConfigFn } from '@/firebase-admin/config';

export default async function UserPage({
  params,
}: {
  params: { id: string[] | undefined };
}) {
  let id = params.id?.[0];

  if (!id) {
    const authConfig = await authConfigFn();
    const tokens = await getTokens(await cookies(), {
      ...authConfig,
      headers: await headers(),
    });

    if (tokens) {
      id = tokens.decodedToken.uid;
    } else {
      redirect('/login?redirect=/user');
    }
  }

  const user = await getUserById(id);
  const contributions = await getContributionsForUser(id);

  if (!user) {
    return <div>User not found</div>;
  }

  return <User user={user} contributions={contributions} />;
}
