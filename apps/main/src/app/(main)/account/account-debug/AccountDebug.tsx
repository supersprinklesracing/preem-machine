'use client';

import * as React from 'react';
import { useLoadingCallback } from 'react-loading-hook';

import { refreshCookies } from '@/actions/refresh-cookies';
import { useAuth } from '@/auth/AuthContext';
import { Button, Card, Stack, Title } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { incrementCounterUsingClientFirestore } from './user-counters';

export interface AccountDebugProps {
  count: number;
  incrementCounter: () => void;
}

export function AccountDebug({ count, incrementCounter }: AccountDebugProps) {
  const router = useRouter();
  const { authUser } = useAuth();

  const [handleClaims, isClaimsLoading] = useLoadingCallback(async () => {
    const headers: Record<string, string> = {};

    await fetch('/api/custom-claims', {
      method: 'POST',
      headers,
    });

    router.refresh();
  });

  const [handleIncrementCounterApi, isIncrementCounterApiLoading] =
    useLoadingCallback(async () => {
      const response = await fetch('/api/debug/user-counters', {
        method: 'POST',
      });

      await response.json();
      router.refresh();
    });

  const [handleIncrementCounterClient, isIncrementCounterClientLoading] =
    useLoadingCallback(async () => {
      if (!authUser) {
        return;
      }

      if (authUser.customToken) {
        await incrementCounterUsingClientFirestore(authUser.customToken);
      } else {
        console.warn(
          'Custom token is not present. Have you set `enableCustomToken` option to `true` in `authMiddleware`?',
        );
      }

      router.refresh();
    });

  const [isIncrementCounterActionPending, startTransition] =
    React.useTransition();

  const [isRefreshCookiesActionPending, startRefreshCookiesTransition] =
    React.useTransition();

  if (!authUser) {
    return null;
  }

  const isIncrementLoading =
    isIncrementCounterApiLoading ||
    isIncrementCounterActionPending ||
    isIncrementCounterClientLoading;

  return (
    <Card withBorder>
      <Stack>
        <Title order={3}>Debug Panel</Title>
        <Title order={5}>Custom claims</Title>
        <pre>{JSON.stringify(authUser.customClaims, undefined, 2)}</pre>
        <Button
          loading={isClaimsLoading}
          disabled={isClaimsLoading}
          onClick={handleClaims}
        >
          Refresh custom user claims
        </Button>
        <Button
          loading={isRefreshCookiesActionPending}
          disabled={isRefreshCookiesActionPending}
          onClick={() => startRefreshCookiesTransition(() => refreshCookies())}
        >
          Refresh cookies w/ server action
        </Button>
        <Title order={3}>Counter: {count}</Title>
        <Button
          loading={isIncrementCounterApiLoading}
          disabled={isIncrementLoading}
          onClick={handleIncrementCounterApi}
        >
          Update counter w/ api endpoint
        </Button>
        <Button
          loading={isIncrementCounterActionPending}
          disabled={isIncrementLoading}
          onClick={() => startTransition(() => incrementCounter())}
        >
          Update counter w/ server action
        </Button>
        <Button
          loading={isIncrementCounterClientLoading}
          disabled={isIncrementLoading}
          onClick={handleIncrementCounterClient}
        >
          Update counter w/ client firestore sdk
        </Button>
      </Stack>
    </Card>
  );
}
