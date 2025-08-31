'use server';

import { getDoc } from '@/datastore/firestore';
import { EditRace } from './EditRace';
import { updateRaceAction } from './update-race-action';
import { Race } from '@/datastore/types';

export default async function EditRacePage({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}) {
  const { path } = await searchParams;
  const doc = await getDoc<Race>(path);
  return <EditRace race={doc} updateRaceAction={updateRaceAction} />;
}
