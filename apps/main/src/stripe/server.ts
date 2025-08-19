import Stripe from 'stripe';

if (!process.env.STRIPE_API_KEY) {
  console.warn('STRIPE_API_KEY environment variable not set.');
}

export const stripe = new Stripe(process.env.STRIPE_API_KEY ?? '', {
  apiVersion: '2023-08-16',
  typescript: true,
});
