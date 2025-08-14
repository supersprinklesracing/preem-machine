'use server';

import { raceSeries } from '@/datastore/mock-data';
import Home from './Home';
import { getUsers } from '@/datastore/data-access';

export default async function Page() {
  const allRaces = raceSeries.flatMap((series) => series.races);
  const allContributions = allRaces
    .flatMap((race) =>
      race.preems.flatMap((preem) =>
        preem.contributionHistory.map((c) => ({
          ...c,
          preemName: preem.name,
          raceName: race.name,
          raceId: race.id,
        }))
      )
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const users = await getUsers();

  return (
    <Home races={allRaces} users={users} contributions={allContributions} />
  );
}
