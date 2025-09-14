import { PreemSchema as schema } from '@/datastore/schema';

export const preemSchema = schema.omit({
  id: true,
  path: true,
  metadata: true,
  raceBrief: true,
});
