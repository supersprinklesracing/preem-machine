'use server';

import { getOrganizationAndRefreshStripeAccount } from '@/app/shared/data-access/organizations';
import { notFound } from 'next/navigation';
import { EditOrganization } from './EditOrganization';
import { updateOrganizationAction } from './update-organization-action';

export default async function EditOrganizationPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  const { organization, error } = await getOrganizationAndRefreshStripeAccount(
    orgId
  );

  if (!organization) {
    notFound();
  }

  return (
    <EditOrganization
      organization={organization}
      stripeError={error}
      updateOrganizationAction={updateOrganizationAction}
    />
  );
}
