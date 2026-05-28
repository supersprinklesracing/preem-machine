import { EventSchema as schema } from '@/datastore/schema';

export const eventSchema = schema.omit({
  id: true,
  path: true,
  organizationId: true,
  seriesId: true,
  metadata: true,
  seriesBrief: true,
});
