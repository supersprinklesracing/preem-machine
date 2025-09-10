'use server';

import { getDoc } from '@/datastore/server/query/query';
import { Event } from '@/datastore/schema';
import { getDocPathFromSearchParams } from '@/datastore/paths';
import { NewRace } from './NewRace';
import { newRaceAction } from './new-race-action';

export default async function NewRacePage({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}) {
  const path = getDocPathFromSearchParams(await searchParams);
  const event = await getDoc<Event>(path);
  return <NewRace event={event} newRaceAction={newRaceAction} path={path} />;
}
