import { OrganizationSchema as schema } from '@/datastore/schema';

export const organizationSchema = schema.omit({
  id: true,
  path: true,
  metadata: true,
  memberRefs: true,
  stripe: true,
});
