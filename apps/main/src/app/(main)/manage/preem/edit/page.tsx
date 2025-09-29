'use server';

import { Metadata } from 'next';

import { CommonLayout } from '@/components/layout/CommonLayout';
import { getDocPathFromSearchParams } from '@/datastore/paths';
import { PreemSchema } from '@/datastore/schema';
import { getDoc } from '@/datastore/server/query/query';

import { editPreemAction } from './edit-preem-action';
import { EditPreem } from './EditPreem';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}): Promise<Metadata> {
  const path = getDocPathFromSearchParams(await searchParams);
  const { name } = await getDoc(PreemSchema, path);
  return {
    title: name,
  };
}

export default async function EditPreemPage({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}) {
  const path = getDocPathFromSearchParams(await searchParams);
  const doc = await getDoc(PreemSchema, path);
  return (
    <CommonLayout>
      <EditPreem preem={doc} editPreemAction={editPreemAction} />
    </CommonLayout>
  );
}
