import { SeriesSchema as schema } from '@/datastore/schema';

export const seriesSchema = schema.omit({
  id: true,
  path: true,
  organizationId: true,
  metadata: true,
  organizationBrief: true,
});
