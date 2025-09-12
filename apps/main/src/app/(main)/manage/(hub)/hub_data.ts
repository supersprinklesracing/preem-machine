import { verifyAuthUser } from '@/auth/server/auth';
import {
  getDocSnap,
  getOrganizationWithSeries,
  getUserById,
} from '@/datastore/server/query/query';
import { OrganizationWithSeries } from '@/datastore/query-schema';
import { Organization } from '@/datastore/schema';
import { cache } from 'react';

export const getHubPageData = cache(async () => {
  const authUser = await verifyAuthUser();

  const result = {
    organizations: [] as OrganizationWithSeries[],
  };
  const organizations = await getOrganizationsForUser(authUser.uid);
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
