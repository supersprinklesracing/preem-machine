import { z } from 'zod';

export const seriesSchema = z.object({
  name: z.string().min(1, 'Series name is required'),
  description: z
    .string()
    .min(10, 'Description must have at least 10 letters')
    .optional()
    .or(z.literal('')),
  website: z.url().optional().or(z.literal('')),
  location: z.string().optional(),
  startDate: z.date().nullable(),
  endDate: z.date().nullable(),
});
