import { z } from 'zod';

export const userSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  avatarUrl: z.string().url().optional(),
  affiliation: z.string().optional(),
  raceLicenseId: z.string().optional(),
  address: z.string().optional(),

  termsAccepted: z.boolean().optional(),
});
