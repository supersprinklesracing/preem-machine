import { Metadata } from 'next';

import { Breadcrumbs } from '@/components/Breadcrumbs/Breadcrumbs';
import { CommonLayout } from '@/components/layout/CommonLayout';

import { Hub } from './Hub';
import { getHubPageData } from './hub-data';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Manage',
  };
}

export default async function LiveOrganizationPage() {
  const data = await getHubPageData();

  return (
    <CommonLayout breadcrumb={<Breadcrumbs brief={null} />}>
      <Hub {...data} />
    </CommonLayout>
  );
}
