'use server-only';

import { getAllRaces } from '@/datastore/data-access';
import Sidebar from './Sidebar';

export default async function SidebarWrapper() {
  const allRaces = await getAllRaces();
  return <Sidebar races={allRaces} />;
}
