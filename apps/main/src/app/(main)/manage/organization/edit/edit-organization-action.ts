'use server';

import { verifyAuthUser } from '@/auth/user';
import { FormActionError, FormActionResult } from '@/components/forms/forms';
import { updateOrganization } from '@/datastore/update';
import { z } from 'zod';

const editOrganizationSchema = z.object({
  name: z.string().min(2),
  website: z.string().url().optional(),
});

export interface EditOrganizationOptions {
  path: string;
  edits: z.infer<typeof editOrganizationSchema>;
}

export async function editOrganizationAction({
  path,
  edits: organization,
}: EditOrganizationOptions): Promise<FormActionResult> {
  try {
    const authUser = await verifyAuthUser();
    const parsedOrganization = editOrganizationSchema.parse(organization);
    await updateOrganization(path, parsedOrganization, authUser);

    return { ok: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    throw new FormActionError(`Failed to save organization: ${message}`);
  }
}
