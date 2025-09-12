'use server';

import { getAuthUser } from '@/auth/server/auth';
import { getEventsForUser } from '@/datastore/server/query/query';
import AvatarCluster from './Shell/AvatarCluster';
import MainAppShell from './Shell/MainAppShell';
import Sidebar from './Shell/Sidebar';

import { User } from '@/datastore/schema';

export interface MainProps {
  currentUser: User | null;
  children: React.ReactNode;
}

export default async function Layout({ children }: MainProps) {
  const authUser = await getAuthUser();
  const events = authUser ? await getEventsForUser(authUser.uid) : [];

  return (
    <MainAppShell
      avatarCluster={<AvatarCluster />}
      sidebar={<Sidebar {...{ events }} />}
    >
      {children}
    </MainAppShell>
  );
}
