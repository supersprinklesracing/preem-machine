import { z } from 'zod';

import { Race } from '@/datastore/schema';

import { preemSchema } from './preem-schema';

export const validatePreemForm = (
  values: z.infer<typeof preemSchema>,
  race: Race,
) => {
  if (values.timeLimit) {
    if (race.startDate && values.timeLimit) {
      if (values.timeLimit > race.startDate) {
        return {
          timeLimit: 'Preem time limit cannot be after race start date',
        };
      }
    }
  }
  return {};
};
