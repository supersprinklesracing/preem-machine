import Stripe from 'stripe';

if (!process.env.STRIPE_API_KEY) {
  console.warn('STRIPE_API_KEY environment variable not set.');
}

export const getStripeServer = () => {
  return new Stripe(process.env.STRIPE_API_KEY ?? '', {
    // @ts-expect-error We specify the version in the environment.
    apiVersion: process.env.STRIPE_API_VERSION,
  });
};
