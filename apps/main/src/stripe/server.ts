'use server';

import Stripe from 'stripe';
import { getSecrets } from '@/secrets';

export const getStripeServer = async () => {
  return new Stripe((await getSecrets()).stripeSecrets.apiKey, {
    // @ts-expect-error We specify the version in the environment.
    apiVersion: process.env.STRIPE_API_VERSION,
  });
};
