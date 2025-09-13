'use server';

import { getDoc } from '@/datastore/server/query/query';
import { EventSchema } from '@/datastore/schema';
import {
  getCollectionPathFromSearchParams,
  getParentPath,
} from '@/datastore/paths';
import { NewRace } from './NewRace';
import { newRaceAction } from './new-race-action';

export default async function NewRacePage({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}) {
  const path = getCollectionPathFromSearchParams(await searchParams);
  const event = await getDoc(EventSchema, getParentPath(path));
  return <NewRace event={event} newRaceAction={newRaceAction} path={path} />;
}
