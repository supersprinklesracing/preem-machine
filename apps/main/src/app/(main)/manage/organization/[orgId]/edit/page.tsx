'use server';

import { getOrganizationById } from '@/datastore/firestore';
import { notFound } from 'next/navigation';
import { EditOrganization } from './EditOrganization';
import { updateOrganizationAction } from './update-organization-action';

export default async function EditOrganizationPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  const organization = await getOrganizationById(orgId);

  if (!organization) {
    notFound();
  }

  return (
    <EditOrganization
      organization={organization}
      updateOrganizationAction={updateOrganizationAction}
    />
  );
}
