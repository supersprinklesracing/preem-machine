'use client';

import { Organization } from '@/datastore/schema';
import {
  Badge,
  Button,
  Card,
  Group,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';
import {
  IconCheck,
  IconClock,
  IconExternalLink,
  IconX,
} from '@tabler/icons-react';
import Stripe from 'stripe';
import { useStripeConnect } from './useStripeConnect';

interface Props {
  organization: Organization;
  stripeError?: string;
}

export function StripeConnectCard({ organization, stripeError }: Props) {
  const {
    isCreatingAccount,
    isCreatingLink,
    error,
    handleCreateAccount,
    handleDashboardLink,
    handleOnboardingLink,
  } = useStripeConnect({ organization });

  const account = organization.stripe?.account;
  const hasAccount = !!account;
  const detailsSubmitted = account?.details_submitted;

  return (
    <Card withBorder radius="md">
      <Stack gap="xs">
        <Group justify="space-between" align="flex-start">
          <Stack gap="xs">
            <Group>
              <Text fw={500}>Stripe Connect</Text>
              <StripeConnectStatusBadge account={account} />
            </Group>
            <Text fz="xs" c="dimmed" mt={3}>
              Manage your Stripe Connect account to receive payouts.
            </Text>
            {stripeError && (
              <Text c="red" size="sm">
                {stripeError}
              </Text>
            )}
          </Stack>
        </Group>
        <Group justify="right">
          {hasAccount ? (
            detailsSubmitted ? (
              <Button
                onClick={handleDashboardLink}
                loading={isCreatingLink}
                leftSection={<IconExternalLink size={14} />}
              >
                View Dashboard
              </Button>
            ) : (
              <Button onClick={handleOnboardingLink} loading={isCreatingLink}>
                Complete Onboarding
              </Button>
            )
          ) : (
            <Button onClick={handleCreateAccount} loading={isCreatingAccount}>
              Create Stripe Account
            </Button>
          )}
        </Group>
        {error && (
          <Text c="red" size="sm" ta="right">
            {error}
          </Text>
        )}
      </Stack>
    </Card>
  );
}

interface StripeConnectStatusBadgeProps {
  account: Stripe.Account | undefined;
}

function StripeConnectStatusBadge({ account }: StripeConnectStatusBadgeProps) {
  if (!account) {
    return null;
  }

  const { payouts_enabled, details_submitted } = account;

  const statusConfig = {
    enabled: {
      color: 'teal',
      icon: IconCheck,
      label: 'Payouts Enabled',
    },
    pending: {
      color: 'orange',
      icon: IconClock,
      label: 'Pending Verification',
    },
    needsOnboarding: {
      color: 'red',
      icon: IconX,
      label: 'Needs Onboarding',
    },
  };

  let status: keyof typeof statusConfig = 'needsOnboarding';
  if (payouts_enabled) {
    status = 'enabled';
  } else if (details_submitted) {
    status = 'pending';
  }

  const { color, icon: Icon, label } = statusConfig[status];

  return (
    <Badge
      color={color}
      leftSection={
        <ThemeIcon size="xs" color={color} variant="light" radius="xl">
          <Icon />
        </ThemeIcon>
      }
    >
      {label}
    </Badge>
  );
}
