'use server';

import { Metadata } from 'next';

import { Breadcrumbs } from '@/components/Breadcrumbs/Breadcrumbs';
import { CommonLayout } from '@/components/layout/CommonLayout';
import { getRenderableHomeDataForPage } from '@/datastore/server/query/query';

import { Home } from './Home';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Home',
  };
}

export default async function Page() {
  const data = await getRenderableHomeDataForPage();
  return (
    <CommonLayout breadcrumb={<Breadcrumbs brief={null} />}>
      <Home {...data} />
    </CommonLayout>
  );
}
