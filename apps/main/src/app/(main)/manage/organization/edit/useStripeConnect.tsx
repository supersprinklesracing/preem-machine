'use client';

import { Organization } from '@/datastore/schema';
import { useState } from 'react';
import { createOnboardingLink } from '@/stripe-datastore/stripe-actions';
import { createDashboardLink } from '@/stripe-datastore/stripe-actions';
import { createStripeConnectAccount } from '@/stripe-datastore/stripe-actions';

interface UseStripeConnectProps {
  organization: Pick<Organization, 'id' | 'stripe'>;
}

export function useStripeConnect({ organization }: UseStripeConnectProps) {
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateAccount = async () => {
    setError(null);
    setIsCreatingAccount(true);
    try {
      const result = await createStripeConnectAccount(organization.id);
      if (result.error) {
        setError(result.error);
      }
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'An unexpected error occurred.',
      );
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const handleDashboardLink = async () => {
    if (!organization.stripe?.connectAccountId) {
      setError('Stripe Connect account ID not found.');
      return;
    }
    setError(null);
    setIsCreatingLink(true);
    try {
      const result = await createDashboardLink(
        organization.stripe.connectAccountId,
        organization.id,
      );

      if (result.success && result.url) {
        window.open(result.url, '_blank');
      } else {
        setError(result.error || 'Failed to create dashboard link.');
      }
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'An unexpected error occurred.',
      );
    } finally {
      setIsCreatingLink(false);
    }
  };

  const handleOnboardingLink = async () => {
    if (!organization.stripe?.connectAccountId) {
      setError('Stripe Connect account ID not found.');
      return;
    }
    setError(null);
    setIsCreatingLink(true);
    try {
      const result = await createOnboardingLink(
        organization.stripe.connectAccountId,
        organization.id,
      );

      if (result.success && result.url) {
        window.location.href = result.url;
      } else {
        setError(result.error || 'Failed to create onboarding link.');
      }
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'An unexpected error occurred.',
      );
    } finally {
      setIsCreatingLink(false);
    }
  };

  return {
    isCreatingAccount,
    isCreatingLink,
    error,
    handleCreateAccount,
    handleDashboardLink,
    handleOnboardingLink,
  };
}
