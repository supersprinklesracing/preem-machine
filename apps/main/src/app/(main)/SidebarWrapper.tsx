'use server-only';

import { getAllRaces } from '@/datastore/firestore';
import Sidebar from './Sidebar';

export default async function SidebarWrapper() {
  const races = await getAllRaces();
  return <Sidebar data={{ races }} />;
}
