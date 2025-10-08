import { z } from 'zod';

import { RaceSchema as schema } from '@/datastore/schema';

export const raceSchema = schema
  .omit({
    id: true,
    path: true,
    metadata: true,
    eventBrief: true,
  })
  .extend({
    name: z.string().min(1, 'Race name is required'),
  });
