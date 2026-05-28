'use server';

import { ENV_STRIPE_ENABLED } from '@preem-machine/env';
import { getStripeApiVersion } from '@preem-machine/env/server';
import Stripe from 'stripe';

import { getSecrets } from '@/secrets';

export const getStripeServer = async (): Promise<Stripe | undefined> => {
  if (!ENV_STRIPE_ENABLED) {
    return undefined;
  }
  const secrets = await getSecrets();
  if (!secrets.stripeSecrets) {
    return undefined;
  }
  return new Stripe(secrets.stripeSecrets.apiKey, {
    apiVersion: getStripeApiVersion() as Stripe.StripeConfig['apiVersion'],
  });
};
