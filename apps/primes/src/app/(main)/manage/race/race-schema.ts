import { RaceSchema as schema } from '@/datastore/schema';

export const raceSchema = schema.omit({
  id: true,
  path: true,
  organizationId: true,
  eventId: true,
  metadata: true,
  eventBrief: true,
});
