'use server';

import { Metadata } from 'next';

import { CommonLayout } from '@/components/layout/CommonLayout';
import { docId, getDocPathFromSearchParams } from '@/datastore/paths';
import { getOrganizationAndRefreshStripeAccount } from '@/stripe-datastore/organizations';

import { editOrganizationAction } from './edit-organization-action';
import { EditOrganization } from './EditOrganization';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}): Promise<Metadata> {
  const path = getDocPathFromSearchParams(await searchParams);
  const { organization } = await getOrganizationAndRefreshStripeAccount(
    docId(path),
  );
  return {
    title: organization.name,
  };
}

export default async function EditOrganizationPage({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}) {
  const path = getDocPathFromSearchParams(await searchParams);
  const { organization, error } = await getOrganizationAndRefreshStripeAccount(
    docId(path),
  );

  return (
    <CommonLayout>
      <EditOrganization
        organization={organization}
        stripeError={error}
        editOrganizationAction={editOrganizationAction}
      />
    </CommonLayout>
  );
}
