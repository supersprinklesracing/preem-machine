'use server';

import { getDoc } from '@/datastore/firestore';
import { EditRace } from './EditRace';
import { editRaceAction } from './edit-race-action';
import { Race } from '@/datastore/schema';
import { clientRaceConverter } from '@/datastore/zod-converters';

export default async function EditRacePage({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}) {
  const { path } = await searchParams;
  const doc = await getDoc<Race>(path, clientRaceConverter);
  return <EditRace race={doc} editRaceAction={editRaceAction} />;
}
