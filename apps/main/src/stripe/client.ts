'use client';

import { type Stripe, loadStripe as loadStripeJs } from '@stripe/stripe-js';
import { ENV_STRIPE_ENABLED } from '../env/env';

export const getStripeClient = async (): Promise<Stripe | undefined> => {
  if (!ENV_STRIPE_ENABLED) {
    return undefined;
  }
  return loadStripeJs(process.env.NEXT_PUBLIC_STRIPE_API_KEY ?? '', {
    apiVersion: process.env.NEXT_PUBLIC_STRIPE_API_VERSION,
  });
};
