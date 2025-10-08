import { z } from 'zod';

import { SeriesSchema as schema } from '@/datastore/schema';

export const seriesSchema = schema
  .omit({
    id: true,
    path: true,
    metadata: true,
    organizationBrief: true,
  })
  .extend({
    name: z.string().min(1, 'Series name is required'),
  });
