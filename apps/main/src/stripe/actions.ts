'use server';

import { getAuthUserFromCookies } from '@/auth/user';
import { getOrganizationFromPreemPath } from '@/datastore/firestore';
import { processContribution } from '@/stripe-datastore/contributions';
import { stripe } from './server';

export async function createPaymentIntent(
  amount: number,
  preemPath: string
): Promise<{ clientSecret: string | null }> {
  const authUser = await getAuthUserFromCookies();
  if (!authUser) {
    throw new Error('User not authenticated');
  }

  const organization = await getOrganizationFromPreemPath(preemPath);
  if (!organization?.stripe?.connectAccountId) {
    throw new Error('Organization does not have a Stripe account connected');
  }

  const connectAccountId = organization.stripe.connectAccountId;

  // Create a PaymentIntent with the order amount and currency
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
      userId: authUser.id,
    },
  });

  return {
    clientSecret: paymentIntent.client_secret,
  };
}

export async function confirmContributionOptimistically(
  paymentIntentId: string
) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status === 'succeeded') {
      // No need to await this, let it run in the background
      processContribution(paymentIntent);
    }
  } catch (error) {
    console.error(
      `Error retrieving PaymentIntent ${paymentIntentId} for optimistic confirmation:`,
      error
    );
  }
}
