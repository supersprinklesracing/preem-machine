'use server';

import { cookies, headers } from 'next/headers';
import { getTokens } from 'next-firebase-auth-edge';
import { refreshServerCookies } from 'next-firebase-auth-edge/lib/next/cookies';
import { authConfigFn } from '@/firebase-admin/config';

export async function refreshCookies() {
  const authConfig = await authConfigFn();
  const tokens = await getTokens(await cookies(), authConfig);

  if (!tokens) {
    throw new Error('Unauthenticated');
  }

  await refreshServerCookies(
    await cookies(),
    new Headers(await headers()),
    authConfig,
  );
}
