'use server';

import { getAuthUser } from '@/auth/user';
import { getEventsForUser } from '@/datastore/firestore';
import { CurrentUser } from '@/datastore/user/UserContext';
import AvatarCluster from './Shell/AvatarCluster';
import MainAppShell from './Shell/MainAppShell';
import Sidebar from './Shell/Sidebar';

export interface MainProps {
  currentUser: CurrentUser | null;
  children: React.ReactNode;
}

export default async function Layout({ children }: MainProps) {
  const authUser = await getAuthUser();
  const events = authUser ? await getEventsForUser(authUser.uid) : [];

  return (
    <MainAppShell
      avatarCluster={<AvatarCluster />}
      sidebar={(onLinkClick) => (
        <Sidebar {...{ events }} onLinkClick={onLinkClick} />
      )}
    >
      {children}
    </MainAppShell>
  );
}
