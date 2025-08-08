import { getFirebaseAdminApp } from '@/firebase-admin';
import { authConfigFn } from '@/firebase-admin/config';
import { ActionIcon, Badge, Group, Stack, Title } from '@mantine/core';
import { IconHome } from '@tabler/icons-react';
import { getFirestore } from 'firebase-admin/firestore';
import { Metadata } from 'next';
import { getTokens } from 'next-firebase-auth-edge/lib/next/tokens';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { incrementCounter } from '../actions/user-counters';
import { UserProfile } from './UserProfile';

async function getUserCounter(): Promise<number> {
  const authConfig = await authConfigFn();
  const db = getFirestore(await getFirebaseAdminApp());
  const tokens = await getTokens(await cookies(), authConfig);

  if (!tokens) {
    throw new Error('Cannot get counter of unauthenticated user');
  }

  const snapshot = await db
    .collection('user-counters')
    .doc(tokens.decodedToken.uid)
    .get();

  const currentUserCounter = await snapshot.data();

  if (!currentUserCounter) {
    return 0;
  }

  return currentUserCounter.count;
}

export default async function Profile() {
  const count = await getUserCounter();

  return (
    <Stack>
      <Title order={1}>
        <Group>
          <ActionIcon component={Link} href="/">
            <IconHome />
          </ActionIcon>
          <span>Profile</span>
          <Badge>Rendered on server</Badge>
        </Group>
      </Title>
      <UserProfile count={count} incrementCounter={incrementCounter} />
    </Stack>
  );
}

// Generate customized metadata based on user cookies
// https://nextjs.org/docs/app/building-your-application/optimizing/metadata
export async function generateMetadata(): Promise<Metadata> {
  const authConfig = await authConfigFn();
  const tokens = await getTokens(await cookies(), authConfig);

  if (!tokens) {
    return {};
  }

  return {
    title: `${tokens.decodedToken.email} profile page | next-firebase-auth-edge example`,
  };
}
