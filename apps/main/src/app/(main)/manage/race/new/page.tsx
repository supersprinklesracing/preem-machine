'use server';

import { CreateRace } from './CreateRace';
import { createRaceAction } from './create-race-action';

export default async function CreateRacePage({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}) {
  return (
    <CreateRace
      createRaceAction={createRaceAction}
      path={(await searchParams).path}
    />
  );
}
