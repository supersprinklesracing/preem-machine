'use server-only';

import { getUserFromCookies } from '@/auth/user';
import { getEventsForUser } from '@/datastore/firestore';
import Sidebar from './Sidebar';

export default async function SidebarWrapper() {
  const authUser = await getUserFromCookies();
  if (!authUser) {
    return <Sidebar data={{ events: [] }} />;
  }

  const events = await getEventsForUser(authUser.uid);
  return <Sidebar data={{ events }} />;
}
