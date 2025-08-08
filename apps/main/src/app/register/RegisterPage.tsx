'use client';

import {
  Button,
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
import { getFirebaseAuth } from '../auth/firebase';
import { appendRedirectParam } from '../shared/redirect';
import { useRedirectAfterLogin } from '../shared/useRedirectAfterLogin';
import { useRedirectParam } from '../shared/useRedirectParam';
import { loginWithCredential } from '../auth';

export function RegisterPage() {
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
        password
      );

      await loginWithCredential(credential);
      await sendEmailVerification(credential.user);
      redirectAfterLogin();

      setHasLogged(true);
    });

  return (
    <Stack>
      <Title order={1}>Register</Title>
      {hasLogged && (
        <Group>
          <Text>
            Redirecting to <strong>{redirect || '/'}</strong>
          </Text>
          <Loader />
        </Group>
      )}
      {!hasLogged && (
        <form onSubmit={registerWithEmailAndPassword}>
          <Stack>
            <TextInput
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              name="email"
              type="email"
              placeholder="Email address"
            />
            <PasswordInput
              required
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
      )}
    </Stack>
  );
}
