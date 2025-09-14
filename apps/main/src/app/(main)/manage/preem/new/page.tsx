'use server';

import { getDoc } from '@/datastore/server/query/query';
import { RaceSchema } from '@/datastore/schema';
import {
  asDocPath,
  getCollectionPathFromSearchParams,
  getParentPath,
} from '@/datastore/paths';
import { NewPreem } from './NewPreem';
import { newPreemAction } from './new-preem-action';

export default async function NewPreemPage({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}) {
  const path = getCollectionPathFromSearchParams(await searchParams);
  const racePath = asDocPath(getParentPath(path));
  const race = await getDoc(RaceSchema, racePath);
  return <NewPreem race={race} newPreemAction={newPreemAction} path={racePath} />;
}
