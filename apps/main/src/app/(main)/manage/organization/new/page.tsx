'use server';

import { NewOrganization } from './NewOrganization';
import { newOrganizationAction } from './new-organization-action';

export default async function NewOrganizationPage() {
  return <NewOrganization newOrganizationAction={newOrganizationAction} />;
}
