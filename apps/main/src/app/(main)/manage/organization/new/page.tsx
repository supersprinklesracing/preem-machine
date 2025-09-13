'use server';

import { NewOrganization } from './NewOrganization';
import { newOrganizationAction } from './new-organization-action';

export default async function NewOrganizationPage({
  // eslint-disable-next-line unused-imports/no-unused-vars
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}) {
  return <NewOrganization newOrganizationAction={newOrganizationAction} />;
}
