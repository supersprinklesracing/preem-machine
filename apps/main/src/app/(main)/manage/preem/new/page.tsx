'use server';

import { Metadata } from 'next';

import { CommonLayout } from '@/components/layout/CommonLayout';
import { getDocPathFromSearchParams } from '@/datastore/paths';
import { RaceSchema } from '@/datastore/schema';
import { getDoc } from '@/datastore/server/query/query';

import { newPreemAction } from './new-preem-action';
import { NewPreem } from './NewPreem';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'New Preem',
  };
}

export default async function NewPreemPage({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}) {
  const path = getDocPathFromSearchParams(await searchParams);
  const race = await getDoc(RaceSchema, path);
  return (
    <CommonLayout>
      <NewPreem race={race} newPreemAction={newPreemAction} path={path} />
    </CommonLayout>
  );
}
