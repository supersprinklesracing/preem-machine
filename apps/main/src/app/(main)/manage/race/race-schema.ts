import { RaceSchema as schema } from '@/datastore/schema';

export const raceSchema = schema.omit({
  id: true,
  path: true,
  metadata: true,
  eventBrief: true,
});
