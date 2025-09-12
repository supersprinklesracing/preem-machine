'use client';

import { type Stripe, loadStripe as loadStripeJs } from '@stripe/stripe-js';
import { ENV_STRIPE_ENABLED } from '../env/env';

export const getStripeClient = async (): Promise<Stripe | null> => {
  if (!ENV_STRIPE_ENABLED) {
    return null;
  }
  return loadStripeJs(process.env.NEXT_PUBLIC_STRIPE_API_KEY ?? '', {
    apiVersion: process.env.NEXT_PUBLIC_STRIPE_API_VERSION,
  });
};
