'use client';

import { loadStripe as loadStripeJs } from '@stripe/stripe-js';

export const getStripeClient = async () => {
  return loadStripeJs(process.env.NEXT_PUBLIC_STRIPE_API_KEY ?? '', {
    apiVersion: process.env.NEXT_PUBLIC_STRIPE_API_VERSION,
  });
};
