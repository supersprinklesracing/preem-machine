'use server';

import { Metadata } from 'next';

import { CommonLayout } from '@/components/layout/CommonLayout';
import { getDocPathFromSearchParams } from '@/datastore/paths';
import { RaceSchema } from '@/datastore/schema';
import { getDoc } from '@/datastore/server/query/query';

import { editRaceAction } from './edit-race-action';
import { EditRace } from './EditRace';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}): Promise<Metadata> {
  const path = getDocPathFromSearchParams(await searchParams);
  const { name } = await getDoc(RaceSchema, path);
  return {
    title: name,
  };
}

export default async function EditRacePage({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}) {
  const path = getDocPathFromSearchParams(await searchParams);
  const doc = await getDoc(RaceSchema, path);
  return (
    <CommonLayout>
      <EditRace race={doc} editRaceAction={editRaceAction} />
    </CommonLayout>
  );
}
