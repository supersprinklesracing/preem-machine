'use client';

import {
  Button,
  Container,
  Group,
  Loader,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from 'firebase/auth';
import Link from 'next/link';
import * as React from 'react';
import { useLoadingCallback } from 'react-loading-hook';

import { appendRedirectParam } from '@/app/(login)/redirect';
import { useRedirectAfterLogin } from '@/app/(login)/useRedirectAfterLogin';
import { useRedirectParam } from '@/app/(login)/useRedirectParam';
import { loginWithCredential } from '@/auth/client/auth';
import { MultiPanelLayout } from '@/components/layout/MultiPanelLayout';
import { getFirebaseAuth } from '@/firebase/client/firebase-client';

export function Register() {
  const [hasLogged, setHasLogged] = React.useState(false);
  const redirect = useRedirectParam();
  const redirectAfterLogin = useRedirectAfterLogin();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const [registerWithEmailAndPassword, isRegisterLoading, error] =
    useLoadingCallback(async (event: React.FormEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setHasLogged(false);
      const auth = getFirebaseAuth();
      const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      await loginWithCredential(credential);
      await sendEmailVerification(credential.user);
      redirectAfterLogin();

      setHasLogged(true);
    });

  if (hasLogged) {
    return (
      <MultiPanelLayout>
        <Title order={1}>Register</Title>
        <Group>
          <Text>
            Redirecting to <strong>{redirect || '/'}</strong>
          </Text>
          <Loader />
        </Group>
      </MultiPanelLayout>
    );
  }

  return (
    <MultiPanelLayout>
      <Container size="md" pt="xl">
        <Stack>
          <Title order={1}>Register</Title>
          <form onSubmit={registerWithEmailAndPassword}>
            <Stack>
              <TextInput
                required
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                name="email"
                type="email"
                placeholder="Email address"
              />
              <PasswordInput
                required
                label="Password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                minLength={8}
              />
              {error && <Text c="red">{error.message}</Text>}
              <Button
                loading={isRegisterLoading}
                disabled={isRegisterLoading}
                type="submit"
              >
                Register
              </Button>
              <Button
                component={Link}
                href={appendRedirectParam('/login', redirect)}
                disabled={isRegisterLoading}
                variant="outline"
              >
                Back to login
              </Button>
            </Stack>
          </form>
        </Stack>
      </Container>
    </MultiPanelLayout>
  );
}
