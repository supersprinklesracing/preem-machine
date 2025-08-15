import { incrementCounter } from '@/actions/user-counters';
import { getUserFromCookies } from '@/auth/user';
import { getFirestore } from '@/firebase-admin/firebase-admin';
import { Container, SimpleGrid, Stack } from '@mantine/core';
import { Metadata } from 'next';
import { Account } from './Account';
import { AccountDebug } from './account-debug/AccountDebug';
import { PreferencesPanel } from './PreferencesPanel';

async function getUserCounter(): Promise<number> {
  const user = await getUserFromCookies();
  const db = await getFirestore();

  if (!user) {
    throw new Error('Cannot get counter of unauthenticated user');
  }

  const snapshot = await db.collection('user-counters').doc(user.uid).get();

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
      <SimpleGrid
        cols={{ base: 1, md: 2 }}
        style={{ alignItems: 'flex-start' }}
      >
        <Stack>
          <Account />
          <PreferencesPanel />
        </Stack>
        <AccountDebug count={count} incrementCounter={incrementCounter} />
      </SimpleGrid>
    </Container>
  );
}

// Generate customized metadata based on user cookies
// https://nextjs.org/docs/app/building-your-application/optimizing/metadata
export async function generateMetadata(): Promise<Metadata> {
  const user = await getUserFromCookies();

  if (!user) {
    return {};
  }

  return {
    title: `${user.email} profile page | next-firebase-auth-edge example`,
  };
}
