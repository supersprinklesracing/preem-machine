import { z } from 'zod';

import { Event } from '@/datastore/schema';

import { raceSchema } from './race-schema';

export const validateRaceForm = (
  values: z.infer<typeof raceSchema>,
  event: Event,
) => {
  if (values.startDate && values.endDate) {
    if (values.endDate < values.startDate) {
      return {
        endDate: 'End date must be after start date',
      };
    }
  }
  if (event.startDate && values.startDate) {
    if (values.startDate < event.startDate) {
      return {
        startDate: 'Race start date cannot be before event start date',
      };
    }
  }
  if (event.endDate && values.endDate) {
    if (values.endDate > event.endDate) {
      return {
        endDate: 'Race end date cannot be after event end date',
      };
    }
  }
  return {};
};
