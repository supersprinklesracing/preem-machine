'use server';

import { verifyAuthUser } from '@/auth/user';
import { createOrganization } from '@/datastore/create';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const createOrganizationSchema = z.object({
  name: z.string().min(2, 'Name must have at least 2 letters'),
  website: z.string().optional(),
});

export async function createOrganizationAction(options: unknown) {
  try {
    const user = await verifyAuthUser();

    const validation = createOrganizationSchema.safeParse(options);

    if (!validation.success) {
      return {
        ok: false,
        error: 'Invalid data.',
      };
    }

    const newOrgSnapshot = await createOrganization(validation.data, user);
    const newOrg = newOrgSnapshot.data();
    if (!newOrg) {
      throw new Error('Failed to create organization.');
    }
    revalidatePath('/manage');
    return { ok: true, organizationId: newOrg.id };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : 'An unknown error occurred.';
    return {
      ok: false,
      error: message,
    };
  }
}
