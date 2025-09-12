'use server';

import { cookies, headers } from 'next/headers';
import { getTokens } from 'next-firebase-auth-edge';
import { refreshServerCookies } from 'next-firebase-auth-edge/lib/next/cookies';
import { serverConfigFn } from '@/firebase/server/config';

export async function refreshCookies() {
  const serverconfig = await serverConfigFn();
  const tokens = await getTokens(await cookies(), serverconfig);

  if (!tokens) {
    throw new Error('Unauthenticated');
  }

  await refreshServerCookies(
    await cookies(),
    new Headers(await headers()),
    serverconfig,
  );
}
