'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { FormActionError, FormActionResult } from '@/components/forms/forms';
import { DocPath } from '@/datastore/paths';
import { createOrganization } from '@/datastore/server/create/create';
import { verifyUserContext } from '@/user/server/user';

import { organizationSchema } from '../organization-schema';

export interface NewOrganizationOptions {
  values: z.infer<typeof organizationSchema>;
}

export async function newOrganizationAction({
  values,
}: NewOrganizationOptions): Promise<FormActionResult<{ path: DocPath }>> {
  try {
    const { authUser } = await verifyUserContext();

    const validation = organizationSchema.safeParse(values);

    if (!validation.success) {
      throw new FormActionError('Invalid data.');
    }

    const newOrgSnapshot = await createOrganization(
      'organizations',
      validation.data,
      authUser,
    );
    const newOrg = newOrgSnapshot.data();
    if (!newOrg) {
      throw new Error('Failed to create organization.');
    }
    revalidatePath('/manage');
    return { path: newOrgSnapshot.ref.path };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : 'An unknown error occurred.';
    throw new FormActionError(message);
  }
}
