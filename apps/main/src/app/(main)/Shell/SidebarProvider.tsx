'use server';

import { getEventsForUser } from '@/datastore/server/query/query';
import { validUserContext } from '@/user/server/user';

import { Sidebar } from './Sidebar';

export async function SidebarProvider() {
  const { user } = await validUserContext();
  const events = user ? await getEventsForUser(user.id) : [];

  return <Sidebar {...{ events, user }} />;
}
