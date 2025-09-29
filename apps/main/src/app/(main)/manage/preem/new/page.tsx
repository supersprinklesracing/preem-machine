'use server';

import { Metadata } from 'next';

import { CommonLayout } from '@/components/layout/CommonLayout';
import {
  asDocPath,
  getCollectionPathFromSearchParams,
  getParentPath,
} from '@/datastore/paths';
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
  const path = getCollectionPathFromSearchParams(await searchParams);
  const racePath = asDocPath(getParentPath(path));
  const race = await getDoc(RaceSchema, racePath);
  return (
    <CommonLayout>
      <NewPreem race={race} newPreemAction={newPreemAction} path={racePath} />
    </CommonLayout>
  );
}
