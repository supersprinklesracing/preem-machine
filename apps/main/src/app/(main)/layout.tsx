'use server';

import { requireAnyUserContext } from '@/user/server/user';

import { AvatarCluster } from './Shell/AvatarCluster';
import { MainAppShell } from './Shell/MainAppShell';
import { MainAppShellProvider } from './Shell/MainAppShellProvider';
import { SidebarProvider } from './Shell/SidebarProvider';

export interface MainProps {
  children: React.ReactNode;
}

export default async function Layout({ children }: MainProps) {
  await requireAnyUserContext();
  return (
    <MainAppShellProvider>
      <MainAppShell
        avatarCluster={<AvatarCluster />}
        sidebar={<SidebarProvider />}
      >
        {children}
      </MainAppShell>
    </MainAppShellProvider>
  );
}
