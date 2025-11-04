'use server';

import { Metadata } from 'next';

import { Breadcrumbs } from '@/components/Breadcrumbs/Breadcrumbs';
import { CommonLayout } from '@/components/layout/CommonLayout';
import { getRenderableHomeDataForPage } from '@/datastore/server/query/query';
import { DocRef } from '@/datastore/schema';

import { Home } from './Home';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Home',
  };
}

export default async function Page() {
  const data = await getRenderableHomeDataForPage();
  const mockFavorites: DocRef[] = [
    { id: 'test-doc-1', path: 'organizations/test-doc-1' },
    { id: 'test-doc-2', path: 'races/test-doc-2' },
    { id: 'test-doc-3', path: 'series/test-doc-3' },
    { id: 'test-doc-4', path: 'events/test-doc-4' },
  ];
  if (data.user) {
    data.user.favoriteRefs = mockFavorites;
  }
  return (
    <CommonLayout breadcrumb={<Breadcrumbs brief={null} />}>
      <Home {...data} />
    </CommonLayout>
  );
}
