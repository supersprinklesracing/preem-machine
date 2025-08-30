'use server';

import { verifyAuthUser } from '@/auth/user';
import { getEventsForUser } from '@/datastore/firestore';
import { CurrentUser } from '@/datastore/user/UserContext';
import AvatarCluster from './AvatarCluster';
import MainAppShell from './MainAppShell';
import Sidebar from './Sidebar';

export interface MainProps {
  currentUser: CurrentUser | null;
  children: React.ReactNode;
}

export default async function Layout({ children }: MainProps) {
  const authUser = await verifyAuthUser();
  const events = await getEventsForUser(authUser.uid);

  return (
    <MainAppShell
      avatarCluster={<AvatarCluster />}
      sidebar={<Sidebar data={{ events: events }} />}
    >
      {children}
    </MainAppShell>
  );
}
