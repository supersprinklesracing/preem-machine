'use server';

import { getAuthUserFromCookies } from '@/auth/user';
import { getEventsForUser } from '@/datastore/firestore';
import { CurrentUser } from '@/datastore/user/UserContext';
import { unauthorized } from 'next/navigation';
import Header from './Header';
import MainAppShell from './MainAppShell';
import Sidebar from './Sidebar';

export interface MainProps {
  currentUser: CurrentUser | null;
  children: React.ReactNode;
}

export default async function Layout({ children }: MainProps) {
  const authUser = await getAuthUserFromCookies();
  if (!authUser) {
    unauthorized();
  }

  const events = await getEventsForUser(authUser.uid);

  return (
    <MainAppShell
      header={<Header />}
      sidebar={<Sidebar data={{ events: events }} />}
    >
      {children}
    </MainAppShell>
  );
}
