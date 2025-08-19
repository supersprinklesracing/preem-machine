'use server';

import { getOrganizationById } from '@/datastore/firestore';
import { notFound } from 'next/navigation';
import { EditOrganization } from './EditOrganization';
import { updateOrganizationAction } from './update-organization-action';

export default async function EditOrganizationPage({
  params,
}: {
  params: { orgId: string };
}) {
  const organization = await getOrganizationById(params.orgId);

  if (!organization) {
    notFound();
  }

  const boundUpdateOrganizationAction = updateOrganizationAction.bind(
    null,
    params.orgId
  );

  return (
    <EditOrganization
      organization={organization}
      updateOrganizationAction={boundUpdateOrganizationAction}
    />
  );
}
