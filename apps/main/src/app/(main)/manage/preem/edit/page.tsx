'use server';

import { PreemSchema } from '@/datastore/schema';
import { getDoc } from '@/datastore/server/query/query';
import { EditPreem } from './EditPreem';
import { editPreemAction } from './edit-preem-action';
import { getDocPathFromSearchParams } from '@/datastore/paths';

export default async function EditPreemPage({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}) {
  const path = getDocPathFromSearchParams(await searchParams);
  const doc = await getDoc(PreemSchema, path);
  return <EditPreem preem={doc} editPreemAction={editPreemAction} />;
}
