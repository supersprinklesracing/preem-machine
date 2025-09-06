import { z } from 'zod';

export const eventSchema = z.object({
  name: z.string().min(2, 'Name must have at least 2 letters'),
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
