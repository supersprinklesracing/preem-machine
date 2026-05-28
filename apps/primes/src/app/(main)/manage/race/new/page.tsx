'use server';

import { Metadata } from 'next';

import { CommonLayout } from '@/components/layout/CommonLayout';
import { getDocPathFromSearchParams } from '@/datastore/paths';
import { EventSchema } from '@/datastore/schema';
import { getDoc } from '@/datastore/server/query/query';

import { newRaceAction } from './new-race-action';
import { NewRace } from './NewRace';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'New Race',
  };
}

export default async function NewRacePage({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}) {
  const path = getDocPathFromSearchParams(await searchParams);
  const event = await getDoc(EventSchema, path);
  return (
    <CommonLayout>
      <NewRace event={event} newRaceAction={newRaceAction} path={path} />
    </CommonLayout>
  );
}
