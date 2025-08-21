'use server';

import { firestore } from '@/firebase-admin';
import { getDoc, doc } from 'firebase-admin/firestore';
import { cookies } from 'next/headers';
import { getAuthUserFromCookies } from 'next-firebase-auth-edge/lib/next/cookies';
import { stripe } from './server';
import { Organization } from '@/datastore/types';
import { getOrganizationFromPreemPath } from '@/datastore/firestore';

export async function createPaymentIntent(
  amount: number,
  preemPath: string
): Promise<{ clientSecret: string | null }> {
  const authUser = await getAuthUserFromCookies({ cookies });
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
  });

  return {
    clientSecret: paymentIntent.client_secret,
  };
}
