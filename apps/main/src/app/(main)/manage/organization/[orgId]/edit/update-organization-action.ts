'use server';

import { verifyAuthUser } from '@/auth/user';
import { updateOrganization } from '@/datastore/update';
import type { Organization } from '@/datastore/types';

export interface UpdateOrganizationOptions {
  path: string;
  organization: Partial<Organization>;
}

export async function updateOrganizationAction({
  path,
  organization,
}: UpdateOrganizationOptions): Promise<{ ok: boolean; error?: string }> {
  try {
    const authUser = await verifyAuthUser();
    await updateOrganization(path, organization, authUser);

    return { ok: true };
  } catch (error) {
    console.error('Failed to update organization document:', error);
    const message =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    return { ok: false, error: `Failed to save organization: ${message}` };
  }
}
