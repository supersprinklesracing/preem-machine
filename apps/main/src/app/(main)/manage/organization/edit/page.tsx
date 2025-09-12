'use server';

import { docId } from '@/datastore/paths';
import { getOrganizationAndRefreshStripeAccount } from '@/stripe-datastore/organizations';
import { EditOrganization } from './EditOrganization';
import { editOrganizationAction } from './edit-organization-action';

export default async function EditOrganizationPage({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}) {
  const { path } = await searchParams;
  const { organization, error } = await getOrganizationAndRefreshStripeAccount(
    docId(path),
  );

  return (
    <EditOrganization
      organization={organization}
      stripeError={error}
      editOrganizationAction={editOrganizationAction}
    />
  );
}
