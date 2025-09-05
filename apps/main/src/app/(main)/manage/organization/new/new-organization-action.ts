'use server';

import { verifyAuthUser } from '@/auth/user';
import { FormActionError, FormActionResult } from '@/components/forms/forms';
import { createOrganization } from '@/datastore/create';
import { DocPath } from '@/datastore/paths';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const newOrganizationSchema = z.object({
  name: z.string().min(2, 'Name must have at least 2 letters'),
  website: z.string().optional(),
});

export async function newOrganizationAction(
  options: unknown,
): Promise<FormActionResult<{ path: DocPath }>> {
  try {
    const user = await verifyAuthUser();

    const validation = newOrganizationSchema.safeParse(options);

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
