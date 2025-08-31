'use server';

import { CreateOrganization } from './CreateOrganization';
import { createOrganizationAction } from './create-organization-action';

export default async function CreateOrganizationPage() {
  return (
    <CreateOrganization createOrganizationAction={createOrganizationAction} />
  );
}
