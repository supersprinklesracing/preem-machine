'use server';

import { getAuthUserFromCookies } from '@/auth/user';
import { getUserById } from '@/datastore/firestore';
import { CurrentUser } from '@/datastore/user/UserContext';
import { unauthorized } from 'next/navigation';
import Header from './Header';
import MainAppShell from './MainAppShell';
import SidebarWrapper from './SidebarWrapper';

export interface MainProps {
  currentUser: CurrentUser | null;
  children: React.ReactNode;
}

export default async function Layout({ children }: MainProps) {
  const authUser = await getAuthUserFromCookies();
  const currentUser = authUser
    ? (await getUserById(authUser.uid)) ?? null
    : null;
  if (!currentUser) {
    unauthorized();
  }
  return (
    <MainAppShell header={<Header />} sidebar={<SidebarWrapper />}>
      {children}
    </MainAppShell>
  );
}
