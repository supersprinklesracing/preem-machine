'use server';

import { verifyAuthUser } from '@/auth/user';
import { FormActionError, FormActionResult } from '@/components/forms/forms';
import { createOrganization } from '@/datastore/create';
import { DocPath } from '@/datastore/paths';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { organizationSchema } from '../organization-schema';

export interface NewOrganizationOptions {
  values: z.infer<typeof organizationSchema>;
}

export async function newOrganizationAction({
  values,
}: NewOrganizationOptions): Promise<FormActionResult<{ path: DocPath }>> {
  try {
    const user = await verifyAuthUser();

    const validation = organizationSchema.safeParse(values);

    if (!validation.success) {
      throw new FormActionError('Invalid data.');
    }

    const newOrgSnapshot = await createOrganization(validation.data, user);
    const newOrg = newOrgSnapshot.data();
    if (!newOrg) {
      throw new Error('Failed to create organization.');
    }
    revalidatePath('/manage');
    return { path: newOrg.path };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : 'An unknown error occurred.';
    throw new FormActionError(message);
  }
}
