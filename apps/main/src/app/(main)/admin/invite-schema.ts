import { InviteSchema as schema } from '@/datastore/schema';

export const inviteSchema = schema.omit({
  id: true,
  path: true,
  metadata: true,
  status: true,
});
