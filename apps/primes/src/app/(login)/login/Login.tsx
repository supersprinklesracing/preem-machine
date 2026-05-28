'use client';

import {
  Button,
  Container,
  Group,
  Loader,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { signIn } from 'next-auth/react';
import * as React from 'react';
import { useLoadingCallback } from 'react-loading-hook';

import { useRedirectParam } from '@/app/(login)/useRedirectParam';
import { MultiPanelLayout } from '@/components/layout/MultiPanelLayout';

export function Login() {
  const [hasLogged, setHasLogged] = React.useState(false);
  const redirect = useRedirectParam();

  const [handleLoginWithGoogle, isGoogleLoading] = useLoadingCallback(
    async () => {
      await signIn('google', {
        callbackUrl: redirect || '/',
      });

      // Since it redirects to Google, this code may not be reached,
      // but we set hasLogged so the UI shows the loading state.
      setHasLogged(true);
    },
  );

  if (hasLogged) {
    return (
      <MultiPanelLayout>
        <Container size="xs" pt="xl">
          <Stack>
            <Title order={1}>Login</Title>
            <Group>
              <Text>
                Redirecting to <strong>{redirect || '/'}</strong>
              </Text>
              <Loader />
            </Group>
          </Stack>
        </Container>
      </MultiPanelLayout>
    );
  }

  return (
    <MultiPanelLayout>
      <Container size="md" pt="xl">
        <Stack>
          <Title order={1}>Login</Title>
          <Stack>
            <Group pt="xl">
              <Button
                loading={isGoogleLoading}
                disabled={isGoogleLoading}
                onClick={handleLoginWithGoogle}
                size="md"
              >
                Log in with Google
              </Button>
            </Group>
          </Stack>
        </Stack>
      </Container>
    </MultiPanelLayout>
  );
}
