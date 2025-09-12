'use server';

import Stripe from 'stripe';
import { getSecrets } from '@/secrets';
import { ENV_STRIPE_ENABLED } from '../env/env';

export const getStripeServer = async (): Promise<Stripe | undefined> => {
  if (!ENV_STRIPE_ENABLED) {
    return undefined;
  }
  const secrets = await getSecrets();
  if (!secrets.stripeSecrets) {
    return undefined;
  }
  return new Stripe(secrets.stripeSecrets.apiKey, {
    // @ts-expect-error We specify the version in the environment.
    apiVersion: process.env.STRIPE_API_VERSION,
  });
};
