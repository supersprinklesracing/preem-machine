'use server';

import { Metadata } from 'next';

import { CommonLayout } from '@/components/layout/CommonLayout';
import {
  getCollectionPathFromSearchParams,
  getParentPath,
} from '@/datastore/paths';
import { OrganizationSchema } from '@/datastore/schema';
import { getDoc } from '@/datastore/server/query/query';

import { newSeriesAction } from './new-series-action';
import { NewSeries } from './NewSeries';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'New Series',
  };
}

export default async function NewSeriesPage({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}) {
  const path = getCollectionPathFromSearchParams(await searchParams);
  const organization = await getDoc(OrganizationSchema, getParentPath(path));
  return (
    <CommonLayout>
      <NewSeries
        organization={organization}
        newSeriesAction={newSeriesAction}
        path={path}
      />
    </CommonLayout>
  );
}
