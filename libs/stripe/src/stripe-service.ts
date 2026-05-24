import { ENV_STRIPE_ENABLED } from '@preem-machine/env';
import { getStripeApiVersion } from '@preem-machine/env/server';
import Stripe from 'stripe';

type SecretsGetter = () => Promise<{
  stripeSecrets?: { apiKey: string; webhookSecret: string };
}>;

let _getSecrets: SecretsGetter | null = null;

/**
 * Configure the Stripe library with the application's secrets getter.
 * Must be called before any Stripe operations.
 */
export function configureStripeLib(getSecrets: SecretsGetter): void {
  _getSecrets = getSecrets;
}

function getConfiguredSecrets(): Promise<{
  stripeSecrets?: { apiKey: string; webhookSecret: string };
}> {
  if (!_getSecrets) {
    throw new Error(
      '@preem-machine/stripe: Library not configured. ' +
        'Call configureStripeLib(getSecrets) before using StripeService.',
    );
  }
  return _getSecrets();
}

/**
 * StripeService modularizes all Stripe SDK operations, cleanly separating
 * external API gateway actions from internal database transactions.
 */
export class StripeService {
  private static stripeInstance: Stripe | undefined;

  /**
   * Retrieves or initializes the shared server-side Stripe client instance.
   */
  public static async getStripeInstance(): Promise<Stripe> {
    if (!ENV_STRIPE_ENABLED) {
      throw new Error(
        'Stripe integration is disabled in the environment configurations.',
      );
    }

    if (this.stripeInstance) {
      return this.stripeInstance;
    }

    const secrets = await getConfiguredSecrets();
    if (!secrets.stripeSecrets?.apiKey) {
      throw new Error(
        'Stripe API Key is not configured in the application secrets.',
      );
    }

    this.stripeInstance = new Stripe(secrets.stripeSecrets.apiKey, {
      apiVersion: getStripeApiVersion() as Stripe.StripeConfig['apiVersion'],
    });

    return this.stripeInstance;
  }

  /**
   * Creates a Stripe Payment Intent targeting an organization's connected account.
   */
  public static async createPaymentIntent({
    amount,
    preemPath,
    isAnonymous: _isAnonymous,
    userId: _userId,
    connectAccountId,
  }: {
    amount: number;
    preemPath: string;
    isAnonymous: boolean;
    userId: string;
    connectAccountId: string;
  }): Promise<Stripe.PaymentIntent> {
    const stripe = await this.getStripeInstance();

    return await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // amount in cents
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      transfer_data: {
        destination: connectAccountId,
      },
      metadata: {
        preemPath,
      },
    });
  }

  /**
   * Retrieves the current state of a Payment Intent from the Stripe API.
   */
  public static async retrievePaymentIntent(
    paymentIntentId: string,
  ): Promise<Stripe.PaymentIntent> {
    const stripe = await this.getStripeInstance();
    return await stripe.paymentIntents.retrieve(paymentIntentId);
  }

  /**
   * Constructs a typed Stripe event from raw request payloads for webhook signature verification.
   */
  public static async constructWebhookEvent(
    body: string,
    signature: string,
    webhookSecret: string,
  ): Promise<Stripe.Event> {
    const stripe = await this.getStripeInstance();
    return stripe.webhooks.constructEvent(body, signature, webhookSecret);
  }
}
