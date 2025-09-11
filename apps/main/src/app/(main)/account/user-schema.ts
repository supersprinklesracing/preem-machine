import { UserSchema as schema } from '@/datastore/schema';

export const userSchema = schema.omit({
  id: true,
  path: true,
  metadata: true,
  organizationRefs: true,
});
