'use client';

import { getToken } from '@firebase/app-check';
import * as React from 'react';
import { useLoadingCallback } from 'react-loading-hook';

import { Button, Card, Stack, Title } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { getAppCheck } from '@/auth/app-check';
import { refreshCookies } from '@/actions/refresh-cookies';
import { useAuth } from '@/auth/AuthContext';
import { incrementCounterUsingClientFirestore } from './user-counters';

interface AccountDebugProps {
  count: number;
  incrementCounter: () => void;
}

export function AccountDebug({ count, incrementCounter }: AccountDebugProps) {
  const router = useRouter();
  const { user } = useAuth();

  const [handleClaims, isClaimsLoading] = useLoadingCallback(async () => {
    const headers: Record<string, string> = {};

    if (process.env.NEXT_PUBLIC_FIREBASE_APP_CHECK_KEY) {
      const appCheckTokenResponse = await getToken(getAppCheck(), false);
      headers['X-Firebase-AppCheck'] = appCheckTokenResponse.token;
    }

    await fetch('/api/custom-claims', {
      method: 'POST',
      headers,
    });

    router.refresh();
  });

  const [handleAppCheck, isAppCheckLoading] = useLoadingCallback(async () => {
    const appCheckTokenResponse = await getToken(getAppCheck(), false);

    const response = await fetch('/api/test-app-check', {
      method: 'POST',
      headers: {
        'X-Firebase-AppCheck': appCheckTokenResponse.token,
      },
    });

    if (response.ok) {
      console.info(
        'Successfully verified App Check token',
        await response.json()
      );
    } else {
      console.error('Could not verify App Check token', await response.json());
    }
  });

  const [handleIncrementCounterApi, isIncrementCounterApiLoading] =
    useLoadingCallback(async () => {
      const response = await fetch('/api/user-counters', {
        method: 'POST',
      });

      await response.json();
      router.refresh();
    });

  const [handleIncrementCounterClient, isIncrementCounterClientLoading] =
    useLoadingCallback(async () => {
      if (!user) {
        return;
      }

      if (user.customToken) {
        await incrementCounterUsingClientFirestore(user.customToken);
      } else {
        console.warn(
          'Custom token is not present. Have you set `enableCustomToken` option to `true` in `authMiddleware`?'
        );
      }

      router.refresh();
    });

  const [isIncrementCounterActionPending, startTransition] =
    React.useTransition();

  const [isRefreshCookiesActionPending, startRefreshCookiesTransition] =
    React.useTransition();

  if (!user) {
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
        <pre>{JSON.stringify(user.customClaims, undefined, 2)}</pre>
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
        {process.env.NEXT_PUBLIC_FIREBASE_APP_CHECK_KEY && (
          <Button
            onClick={handleAppCheck}
            loading={isAppCheckLoading}
            disabled={isAppCheckLoading}
          >
            Test AppCheck integration
          </Button>
        )}
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
