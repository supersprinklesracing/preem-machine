'use server';

import { RaceSchema } from '@/datastore/schema';
import { getDoc } from '@/datastore/server/query/query';
import { EditRace } from './EditRace';
import { editRaceAction } from './edit-race-action';

export default async function EditRacePage({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}) {
  const { path } = await searchParams;
  const doc = await getDoc(RaceSchema, path);
  return <EditRace race={doc} editRaceAction={editRaceAction} />;
}
