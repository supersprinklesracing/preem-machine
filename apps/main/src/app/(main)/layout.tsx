'use server';

import { getEventsForUser } from '@/datastore/server/query/query';
import { validUserContext } from '@/user/server/user';

import { AvatarCluster } from './Shell/AvatarCluster';
import { MainAppShell } from './Shell/MainAppShell';
import { MainAppShellProvider } from './Shell/MainAppShellProvider';
import { Sidebar } from './Shell/Sidebar';

export interface MainProps {
  children: React.ReactNode;
}

export default async function Layout({ children }: MainProps) {
  const { user } = await validUserContext();
  const events = user ? await getEventsForUser(user.id) : [];

  return (
    <MainAppShellProvider>
      <MainAppShell
        avatarCluster={<AvatarCluster />}
        sidebar={<Sidebar {...{ events, user }} />}
      >
        {children}
      </MainAppShell>
    </MainAppShellProvider>
  );
}
