'use server';

import { getCollectionPathFromSearchParams } from '@/datastore/paths';
import { NewRace } from './NewRace';
import { newRaceAction } from './new-race-action';

export default async function NewRacePage({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}) {
  return (
    <NewRace
      newRaceAction={newRaceAction}
      path={getCollectionPathFromSearchParams(await searchParams)}
    />
  );
}
