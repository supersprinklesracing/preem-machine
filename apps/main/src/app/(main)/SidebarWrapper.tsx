'use client';

import { raceSeries } from '@/datastore/mock-data';
import Sidebar from './Sidebar';

export default function SidebarWrapper() {
  const allRaces = raceSeries
    .flatMap((series) => series.events)
    .flatMap((event) => event.races);
  return <Sidebar races={allRaces} />;
}
