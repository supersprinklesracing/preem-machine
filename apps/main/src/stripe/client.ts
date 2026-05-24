'use client';

import {
  ENV_STRIPE_ENABLED,
  getNextPublicStripeApiKey,
  getNextPublicStripeApiVersion,
} from '@preem-machine/env';
import { loadStripe as loadStripeJs, type Stripe } from '@stripe/stripe-js';

let stripePromiseCache: Promise<Stripe | null> | null = null;

export const getStripeClient = (): Promise<Stripe | null> => {
  if (!stripePromiseCache) {
    if (!ENV_STRIPE_ENABLED) {
      stripePromiseCache = Promise.resolve(null);
    } else {
      stripePromiseCache = loadStripeJs(getNextPublicStripeApiKey() ?? '', {
        apiVersion: getNextPublicStripeApiVersion(),
      });
    }
  }
  return stripePromiseCache;
};
