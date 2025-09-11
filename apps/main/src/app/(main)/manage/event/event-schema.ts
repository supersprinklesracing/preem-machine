import { EventSchema as schema } from '@/datastore/schema';

export const eventSchema = schema.omit({
  id: true,
  path: true,
  metadata: true,
  seriesBrief: true,
});
