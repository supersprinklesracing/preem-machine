'use server';

import { StripeService } from '@preem-machine/stripe';

import { getOrganizationFromPath } from '@/datastore/server/query/query';
import { processContribution } from '@/stripe-datastore/contributions';
import { requireLoggedInUserContext } from '@/user/server/user';

export async function createPaymentIntent(
  amount: number,
  preemPath: string,
  isAnonymous: boolean,
): Promise<{ clientSecret: string | null }> {
  const { authUser } = await requireLoggedInUserContext();

  const organization = await getOrganizationFromPath(preemPath);
  if (!organization?.stripe?.connectAccountId) {
    throw new Error('Organization does not have a Stripe account connected');
  }

  const connectAccountId = organization.stripe.connectAccountId;

  const paymentIntent = await StripeService.createPaymentIntent({
    amount,
    preemPath,
    isAnonymous,
    userId: authUser.uid,
    connectAccountId,
  });

  return {
    clientSecret: paymentIntent.client_secret,
  };
}

export async function confirmContributionOptimistically(
  paymentIntentId: string,
) {
  try {
    const paymentIntent =
      await StripeService.retrievePaymentIntent(paymentIntentId);
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
