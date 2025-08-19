import 'server-only';

import { getOrganizationById } from '@/datastore/firestore';
import { ClientCompat, Organization } from '@/datastore/types';
import { stripe } from '@/stripe/server';
import { cache } from 'react';

export const getOrganizationAndRefreshStripeAccount = cache(
  async (
    id: string
  ): Promise<{
    organization?: ClientCompat<Organization>;
    error?: string;
  }> => {
    const organization = await getOrganizationById(id);
    if (!organization) {
      return { organization: undefined };
    }

    // Enrich with Stripe data if a connect account exists.
    if (organization.stripe?.connectAccountId) {
      try {
        const account = await stripe.accounts.retrieve(
          organization.stripe.connectAccountId
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
          error
        );
        return { organization, error: errorMessage };
      }
    }

    return { organization };
  }
);
