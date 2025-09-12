'use server';

import { getAuthUser } from '@/auth/server/auth';
import { isUserAuthorized } from '@/datastore/server/access';
import { updateOrganizationStripeConnectAccount } from '@/datastore/server/update/update';
import { ENV_URL_PREFIX } from '@/env/env';
import { getStripeServer } from '@/stripe/server';
import { revalidatePath } from 'next/cache';
import { default as Stripe } from 'stripe';

export async function createStripeConnectAccount(
  organizationId: string,
): Promise<{
  success: boolean;
  error?: string;
  accountId?: string;
}> {
  const authUser = await getAuthUser();
  if (!authUser) {
    // This should be caught by middleware, but as a safeguard:
    return { success: false, error: 'User not authenticated' };
  }

  // Although the mutation also checks for authorization, we check it here first
  // to prevent creating a Stripe account unnecessarily if the user is not authorized.
  const authorized = await isUserAuthorized(
    authUser,
    `organizations/${organizationId}`,
  );
  if (!authorized) {
    return { success: false, error: 'User not authorized' };
  }

  try {
    const stripe = await getStripeServer();
    if (!stripe) {
      throw new Error('Stripe not configured');
    }
    const account = await stripe.accounts.create({
      type: 'express',
    });

    await updateOrganizationStripeConnectAccount(
      organizationId,
      account,
      authUser,
    );

    revalidatePath(`/manage/organization/${organizationId}/edit`);

    return {
      success: true,
      accountId: account.id,
    };
  } catch (error) {
    console.error('Stripe account creation failed:', error);

    let errorMessage = 'An unknown error occurred.';
    if (error instanceof Stripe.errors.StripeInvalidRequestError) {
      // This is a platform configuration issue that the end-user cannot resolve.
      // Log the detailed error for the admin and show a generic message to the user.
      errorMessage =
        'A configuration error occurred. Please contact support for assistance.';
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return { success: false, error: errorMessage };
  }
}

export async function createDashboardLink(
  accountId: string,
  organizationId: string,
): Promise<{ success: boolean; error?: string; url?: string }> {
  const authUser = await getAuthUser();
  if (!authUser) {
    return { success: false, error: 'User not authenticated' };
  }

  const authorized = await isUserAuthorized(
    authUser,
    `organizations/${organizationId}`,
  );
  if (!authorized) {
    return { success: false, error: 'User not authorized' };
  }

  try {
    const stripe = await getStripeServer();
    if (!stripe) {
      throw new Error('Stripe not configured');
    }
    const loginLink = await stripe.accounts.createLoginLink(accountId);
    return { success: true, url: loginLink.url };
  } catch (error) {
    console.error('Stripe dashboard link creation failed:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: errorMessage };
  }
}

export async function createOnboardingLink(
  accountId: string,
  organizationId: string,
): Promise<{ success: boolean; error?: string; url?: string }> {
  const authUser = await getAuthUser();
  if (!authUser) {
    return { success: false, error: 'User not authenticated' };
  }

  const authorized = await isUserAuthorized(
    authUser,
    `organizations/${organizationId}`,
  );
  if (!authorized) {
    return { success: false, error: 'User not authorized' };
  }

  try {
    const params: Stripe.AccountLinkCreateParams = {
      account: accountId,
      refresh_url: `${ENV_URL_PREFIX}/manage/organization/${organizationId}/edit`,
      return_url: `${ENV_URL_PREFIX}/manage/organization/${organizationId}/edit`,
      type: 'account_onboarding',
    };
    const stripe = await getStripeServer();
    if (!stripe) {
      throw new Error('Stripe not configured');
    }
    const accountLink = await stripe.accountLinks.create(params);
    return { success: true, url: accountLink.url };
  } catch (error) {
    console.error('Stripe onboarding link creation failed:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: errorMessage };
  }
}
