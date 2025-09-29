import { Metadata } from 'next';

import { Breadcrumbs } from '@/components/Breadcrumbs/Breadcrumbs';
import { CommonLayout } from '@/components/layout/CommonLayout';
import { getDocPathFromSearchParams } from '@/datastore/paths';
import { getRenderableOrganizationDataForPage } from '@/datastore/server/query/query';

import { Organization } from './Organization';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}): Promise<Metadata> {
  const path = getDocPathFromSearchParams(await searchParams);
  const { organization } = await getRenderableOrganizationDataForPage(path);
  return {
    title: organization.name,
  };
}

export default async function OrganizationPage({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}) {
  const path = getDocPathFromSearchParams(await searchParams);
  const data = await getRenderableOrganizationDataForPage(path);
  return (
    <CommonLayout breadcrumb={<Breadcrumbs brief={data.organization} />}>
      <Organization {...data} />
    </CommonLayout>
  );
}
