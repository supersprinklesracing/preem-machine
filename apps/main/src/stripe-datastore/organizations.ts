import 'server-only';

import { getDoc } from '@/datastore/server/query/query';
import { Organization, OrganizationSchema } from '@/datastore/schema';
import { getStripeServer } from '@/stripe/server';
import { cache } from 'react';

export const getOrganizationAndRefreshStripeAccount = cache(
  async (
    id: string,
  ): Promise<{
    organization: Organization;
    error?: string;
  }> => {
    const organization = await getDoc(
      OrganizationSchema,
      `organizations/${id}`,
    );

    // Enrich with Stripe data if a connect account exists.
    if (organization.stripe?.connectAccountId) {
      try {
        const stripe = await getStripeServer();
        if (!stripe) {
          throw new Error('Stripe not configured');
        }
        const account = await stripe.accounts.retrieve(
          organization.stripe.connectAccountId,
        );
        // Convert the Stripe Account object to a plain JSON object to pass to client components.
        organization.stripe.account = JSON.parse(JSON.stringify(account));
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'An unknown error occurred while fetching Stripe account details.';
        console.error(
          `Failed to retrieve Stripe account for organization ${id}:`,
          error,
        );
        return { organization, error: errorMessage };
      }
    }

    return { organization };
  },
);
