'use server';

import { raceSeries } from '@/datastore/mock-data';
import Home from './Home';

export default async function Page() {
  const allRaces = raceSeries.flatMap((series) => series.races);

  return <Home races={allRaces} />;
}
