import { z } from 'zod';

export const raceSchema = z.object({
  name: z.string().min(2, 'Name must have at least 2 letters'),
  description: z
    .string()
    .min(10, 'Description must have at least 10 letters')
    .optional()
    .or(z.literal('')),
  website: z.url().optional().or(z.literal('')),
  location: z.string().optional(),
  category: z.string().optional(),
  gender: z.string().optional(),
  courseDetails: z.string().optional(),
  maxRacers: z.number().optional(),
  ageCategory: z.string().optional(),
  duration: z.string().optional(),
  laps: z.number().optional(),
  podiums: z.number().optional(),
  sponsors: z.array(z.string()).optional(),
  startDate: z.date().nullable(),
  endDate: z.date().nullable(),
});
