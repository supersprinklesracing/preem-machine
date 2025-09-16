'use server';

import { getEventsForUser } from '@/datastore/server/query/query';
import AvatarCluster from './Shell/AvatarCluster';
import MainAppShell from './Shell/MainAppShell';
import Sidebar from './Shell/Sidebar';

import { getUserContext } from '@/user/server/user';

export interface MainProps {
  children: React.ReactNode;
}

export default async function Layout({ children }: MainProps) {
  const { user } = await getUserContext();
  const events = user ? await getEventsForUser(user.id) : [];

  return (
    <MainAppShell
      avatarCluster={<AvatarCluster />}
      sidebar={<Sidebar {...{ events }} />}
    >
      {children}
    </MainAppShell>
  );
}
