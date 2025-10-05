import { z } from 'zod';

import { PreemSchema as schema } from '@/datastore/schema';

export const preemSchema = schema
  .omit({
    id: true,
    path: true,
    metadata: true,
    raceBrief: true,
  })
  .extend({
    name: z.string().min(1, 'Preem name is required'),
  });
