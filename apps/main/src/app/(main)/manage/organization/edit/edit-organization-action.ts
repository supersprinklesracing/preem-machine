'use server';

import { verifyAuthUser } from '@/auth/user';
import { FormActionError, FormActionResult } from '@/components/forms/forms';
import { DocPath } from '@/datastore/paths';
import { updateOrganization } from '@/datastore/update';
import { z } from 'zod';
import { organizationSchema } from '../organization-schema';

export interface EditOrganizationOptions {
  path: DocPath;
  edits: z.infer<typeof organizationSchema>;
}

export async function editOrganizationAction({
  path,
  edits: organization,
}: EditOrganizationOptions): Promise<FormActionResult> {
  try {
    const authUser = await verifyAuthUser();
    const parsedOrganization = organizationSchema.parse(organization);
    await updateOrganization(path, parsedOrganization, authUser);

    return {};
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    throw new FormActionError(`Failed to save organization: ${message}`);
  }
}
