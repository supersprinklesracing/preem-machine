import { z } from 'zod';

import { seriesSchema } from './series-schema';

export const validateSeriesForm = (values: z.infer<typeof seriesSchema>) => {
  if (values.startDate && values.endDate) {
    if (values.endDate < values.startDate) {
      return {
        endDate: 'End date must be after start date',
      };
    }
  }
  return {};
};