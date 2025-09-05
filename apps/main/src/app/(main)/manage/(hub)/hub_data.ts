import { verifyAuthUser } from '@/auth/user';
import {
  getDocSnap,
  getOrganizationWithSeries,
  getUserById,
  OrganizationWithSeries,
} from '@/datastore/firestore';
import type { Organization } from '@/datastore/types';
import { cache } from 'react';

export const getHubPageData = cache(async () => {
  const authUser = await verifyAuthUser();

  const result = {
    organizations: [] as OrganizationWithSeries[],
  };
  const organizations = await getOrganizationsForUser(authUser.id);
  for (const orgForUser of organizations) {
    result.organizations.push(await getOrganizationWithSeries(orgForUser));
  }
  return result;
});

export const getOrganizationsForUser = cache(async (userId: string) => {
  const user = await getUserById(userId);
  if (!user || !user.organizationRefs) {
    return [];
  }
  return await Promise.all(
    user.organizationRefs.map((ref) => getDocSnap<Organization>(ref.path)),
  );
});
