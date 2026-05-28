'use server';

import { getEventsForUser } from '@/datastore/server/query/query';
import { getUserContext } from '@/user/server/user';

import { Sidebar } from './Sidebar';

export async function SidebarProvider() {
  const { user } = await getUserContext();
  const events = user ? await getEventsForUser(user.id) : [];

  return <Sidebar {...{ events, user }} />;
}
