'use server';

import { verifyUserContext } from '@/user/server/user';
import { getOrganizationFromPath } from '@/datastore/server/query/query';
import { processContribution } from '@/stripe-datastore/contributions';
import { getStripeServer } from './server';

export async function createPaymentIntent(
  amount: number,
  preemPath: string,
  isAnonymous: boolean,
): Promise<{ clientSecret: string | null }> {
  const { authUser } = await verifyUserContext();

  const organization = await getOrganizationFromPath(preemPath);
  if (!organization?.stripe?.connectAccountId) {
    throw new Error('Organization does not have a Stripe account connected');
  }

  const connectAccountId = organization.stripe.connectAccountId;

  // Create a PaymentIntent with the order amount and currency
  const stripe = await getStripeServer();
  if (!stripe) {
    throw new Error('Stripe not configured');
  }
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100, // amount in cents
    currency: 'usd',
    automatic_payment_methods: {
      enabled: true,
    },
    transfer_data: {
      destination: connectAccountId,
    },
    metadata: {
      preemPath,
      userId: authUser.uid,
      isAnonymous: String(isAnonymous),
    },
  });

  return {
    clientSecret: paymentIntent.client_secret,
  };
}

export async function confirmContributionOptimistically(
  paymentIntentId: string,
) {
  try {
    const stripe = await getStripeServer();
    if (!stripe) {
      throw new Error('Stripe not configured');
    }
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status === 'succeeded') {
      // No need to await this, let it run in the background
      processContribution(paymentIntent);
    }
  } catch (error) {
    console.error(
      `Error retrieving PaymentIntent ${paymentIntentId} for optimistic confirmation:`,
      error,
    );
  }
}
