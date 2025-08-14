'use client';

import { raceSeries } from '@/datastore/mock-data';
import Sidebar from './Sidebar';

export default function SidebarWrapper() {
  const allRaces = raceSeries.flatMap((series) => series.races);
  return <Sidebar races={allRaces} />;
}
