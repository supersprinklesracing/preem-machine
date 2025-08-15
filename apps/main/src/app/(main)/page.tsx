'use server';

import { getEventsWithRaces, getUsers } from '@/datastore/data-access';
import Home from './Home';

export default async function Page() {
  const eventsWithRaces = await getEventsWithRaces();
  const allContributions = eventsWithRaces
    .flatMap(({ race }) =>
      race.preems.flatMap((preem) =>
        preem.contributionHistory.map((c) => ({
          ...c,
          preemName: preem.name,
          raceName: race.name,
          raceId: race.id,
          preemId: preem.id,
        }))
      )
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const users = await getUsers();

  return (
    <Home
      eventsWithRaces={eventsWithRaces}
      users={users}
      contributions={allContributions}
    />
  );
}
