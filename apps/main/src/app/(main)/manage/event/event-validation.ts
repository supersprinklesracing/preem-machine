import { z } from 'zod';

import { Series } from '@/datastore/schema';

import { eventSchema } from './event-schema';

export const validateEventForm = (
  values: z.infer<typeof eventSchema>,
  series: Series,
) => {
  if (values.startDate && values.endDate) {
    if (values.endDate < values.startDate) {
      return {
        endDate: 'End date must be after start date',
      };
    }
  }
  if (series.startDate && values.startDate) {
    if (values.startDate < series.startDate) {
      return {
        startDate: 'Event start date cannot be before series start date',
      };
    }
  }
  if (series.endDate && values.endDate) {
    if (values.endDate > series.endDate) {
      return {
        endDate: 'Event end date cannot be after series end date',
      };
    }
  }
  return {};
};
