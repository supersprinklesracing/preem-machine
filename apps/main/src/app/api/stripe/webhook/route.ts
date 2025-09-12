import { ENV_STRIPE_ENABLED } from '@/env/env';
import { getOrganizationByStripeConnectAccountId } from '@/datastore/server/query/query';
import { updateOrganizationStripeConnectAccountForWebhook } from '@/datastore/server/update/update';
import { getSecrets } from '@/secrets';
import { processContribution } from '@/stripe-datastore/contributions';
import { getStripeServer } from '@/stripe/server';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import type Stripe from 'stripe';

export async function POST(req: Request) {
  if (!ENV_STRIPE_ENABLED) {
    return new NextResponse('Stripe is not enabled', { status: 500 });
  }
  const secrets = await getSecrets();
  const webhookSecret = secrets.stripeSecrets?.webhookSecret;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 },
    );
  }

  const signature = (await headers()).get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const body = await req.text();
    const stripe = await getStripeServer();
    if (!stripe) {
      throw new Error('Stripe not configured');
    }
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Webhook signature verification failed: ${errorMessage}`);
    return NextResponse.json(
      { error: `Webhook Error: ${errorMessage}` },
      { status: 400 },
    );
  }

  switch (event.type) {
    case 'account.updated':
      await handleAccountUpdated(event.data.object as Stripe.Account);
      break;
    case 'payment_intent.succeeded':
      await handlePaymentIntentSucceeded(
        event.data.object as Stripe.PaymentIntent,
      );
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent,
) {
  await processContribution(paymentIntent);
}

async function handleAccountUpdated(account: Stripe.Account) {
  const orgDoc = await getOrganizationByStripeConnectAccountId(account.id);

  if (!orgDoc) {
    console.error(`No organization found for Stripe account ${account.id}`);
    return;
  }

  await updateOrganizationStripeConnectAccountForWebhook(orgDoc.id, account);

  console.log(`Updated organization ${orgDoc.id} with Stripe account data.`);
}
