import { z } from 'zod';

import { UserSchema as schema } from '@/datastore/schema';

export const userSchema = schema.pick({
  name: true,
  email: true,
  avatarUrl: true,
  affiliation: true,
  raceLicenseId: true,
  address: true,
});

export const newUserSchema = userSchema.extend({
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
});

export const updateUserSchema = userSchema
  .pick({
    name: true,
    affiliation: true,
    raceLicenseId: true,
    address: true,
  })
  .partial();

export const updateUserAvatarSchema = userSchema
  .pick({
    avatarUrl: true,
  })
  .partial();
