'use server';

import { getAuthUserFromCookies } from '@/auth/user';
import type { Organization } from '@/datastore/types';
import { getFirestore } from '@/firebase-admin/firebase-admin';

export interface UpdateOrganizationOptions {
  organization?: Partial<Organization>;
}

export async function updateOrganizationAction(
  organizationId: string,
  updateOrganization: UpdateOrganizationOptions
): Promise<{ ok: boolean; error?: string }> {
  try {
    const authUser = await getAuthUserFromCookies();
    if (!authUser) {
      return { ok: false, error: 'Authentication required.' };
    }

    if (updateOrganization.organization) {
      const db = await getFirestore();
      const orgRef = db.collection('organizations').doc(organizationId);
      const orgDoc = await orgRef.get();

      if (!orgDoc.exists) {
        return { ok: false, error: 'Organization does not exist.' };
      }

      await orgRef.update(updateOrganization.organization);
    }

    return { ok: true };
  } catch (error) {
    console.error('Failed to update organization document:', error);
    const message =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    return { ok: false, error: `Failed to save organization: ${message}` };
  }
}
