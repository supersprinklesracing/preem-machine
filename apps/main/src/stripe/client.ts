'use client';

import { loadStripe } from '@stripe/stripe-js';

export const stripePromise = loadStripe(
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  process.env.NEXT_PUBLIC_STRIPE_API_KEY!,
);
