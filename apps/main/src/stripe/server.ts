import Stripe from 'stripe';

export const getStripeServer = () => {
  return new Stripe(process.env.STRIPE_API_KEY ?? '', {
    // @ts-expect-error We specify the version in the environment.
    apiVersion: process.env.STRIPE_API_VERSION,
  });
};
