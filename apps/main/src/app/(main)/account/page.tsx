import { incrementCounter } from '@/actions/user-counters';
import { getFirebaseAdminApp } from '@/firebase-admin';
import { authConfigFn } from '@/firebase-admin/config';
import { getFirestore } from 'firebase-admin/firestore';
import { Metadata } from 'next';
import { getTokens } from 'next-firebase-auth-edge/lib/next/tokens';
import { cookies } from 'next/headers';
import { Account } from './Account';
import { DebugPanel } from './debug-panel/DebugPanel';
import { Container, SimpleGrid } from '@mantine/core';

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

  const currentUserCounter = snapshot.data();

  if (!currentUserCounter) {
    return 0;
  }

  return currentUserCounter.count;
}

export default async function AccountPage() {
  const count = await getUserCounter();

  return (
    <Container size="lg" pt="xl">
      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <Account />
        <DebugPanel count={count} incrementCounter={incrementCounter} />
      </SimpleGrid>
    </Container>
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
