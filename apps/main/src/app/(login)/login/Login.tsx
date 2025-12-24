'use client';

import {
  Anchor,
  Button,
  Container,
  Group,
  Loader,
  PasswordInput,
  Stack,
  Switch,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import {
  getRedirectResult,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailAndPassword,
  signInWithEmailLink,
  UserCredential,
} from 'firebase/auth';
import Link from 'next/link';
import * as React from 'react';
import { useLoadingCallback } from 'react-loading-hook';

import { appendRedirectParam } from '@/app/(login)/redirect';
import { useRedirectAfterLogin } from '@/app/(login)/useRedirectAfterLogin';
import { useRedirectParam } from '@/app/(login)/useRedirectParam';
import { loginWithCredential } from '@/auth/client/auth';
import { MultiPanelLayout } from '@/components/layout/MultiPanelLayout';
import { ENV_URL_PREFIX } from '@/env/env';
import { getFirebaseAuth } from '@/firebase/client/firebase-client';

import {
  getGoogleProvider,
  loginWithProvider,
  loginWithProviderUsingRedirect,
} from './providers';

export function Login({
  loginAction,
}: {
  loginAction: (email: string, password: string) => void;
}) {
  const [hasLogged, setHasLogged] = React.useState(false);
  const [shouldLoginWithAction, setShouldLoginWithAction] =
    React.useState(false);
  const [isLoginActionPending, startTransition] = React.useTransition();
  const redirect = useRedirectParam();
  const redirectAfterLogin = useRedirectAfterLogin();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleLogin = React.useCallback(
    async (credential: UserCredential) => {
      await loginWithCredential(credential);
      redirectAfterLogin();
    },
    [redirectAfterLogin],
  );

  const [handleLoginWithEmailAndPassword, isEmailLoading, emailPasswordError] =
    useLoadingCallback(async (event: React.FormEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setHasLogged(false);

      const auth = getFirebaseAuth();

      if (shouldLoginWithAction) {
        startTransition(() => loginAction(email, password));
      } else {
        await handleLogin(
          await signInWithEmailAndPassword(auth, email, password),
        );

        setHasLogged(true);
      }
    });

  const [handleLoginWithGoogle, isGoogleLoading, googleError] =
    useLoadingCallback(async () => {
      setHasLogged(false);

      const auth = getFirebaseAuth();
      await handleLogin(await loginWithProvider(auth, getGoogleProvider(auth)));

      setHasLogged(true);
    });

  const [
    handleLoginWithGoogleUsingRedirect,
    isGoogleUsingRedirectLoading,
    googleUsingRedirectError,
  ] = useLoadingCallback(async () => {
    setHasLogged(false);

    const auth = getFirebaseAuth();
    await loginWithProviderUsingRedirect(auth, getGoogleProvider(auth));

    setHasLogged(true);
  });

  const handleLoginWithRedirect = React.useCallback(async () => {
    const auth = getFirebaseAuth();
    const credential = await getRedirectResult(auth);

    if (credential?.user) {
      await handleLogin(credential);

      setHasLogged(true);
    }
  }, [handleLogin]);

  React.useEffect(() => {
    handleLoginWithRedirect();
  }, [handleLoginWithRedirect]);

  const [handleLoginWithEmailLink, isEmailLinkLoading, emailLinkError] =
    useLoadingCallback(async () => {
      const auth = getFirebaseAuth();
      const email = window.prompt('Please provide your email');

      if (!email) {
        return;
      }

      window.localStorage.setItem('emailForSignIn', email);

      await sendSignInLinkToEmail(auth, email, {
        url: `${ENV_URL_PREFIX}/login`,
        handleCodeInApp: true,
      });
    });

  const handleLoginWithEmailLinkCallback = React.useCallback(async () => {
    const auth = getFirebaseAuth();
    if (!isSignInWithEmailLink(auth, window.location.href)) {
      return;
    }

    let email = window.localStorage.getItem('emailForSignIn');
    if (!email) {
      email = window.prompt('Please provide your email for confirmation');
    }

    if (!email) {
      return;
    }

    setHasLogged(false);

    await handleLogin(
      await signInWithEmailLink(auth, email, window.location.href),
    );
    window.localStorage.removeItem('emailForSignIn');

    setHasLogged(true);
  }, [handleLogin]);

  React.useEffect(() => {
    handleLoginWithEmailLinkCallback();
  }, [handleLoginWithEmailLinkCallback]);

  const error =
    emailPasswordError ||
    googleError ||
    emailLinkError ||
    googleUsingRedirectError;

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
            <form onSubmit={handleLoginWithEmailAndPassword}>
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
                <Switch
                  checked={shouldLoginWithAction}
                  onChange={(event) =>
                    setShouldLoginWithAction(event.currentTarget.checked)
                  }
                  label="Login with Server Action"
                />
                {error && <Text c="red">{error.message}</Text>}
                <Button
                  loading={isEmailLoading || isLoginActionPending}
                  disabled={isEmailLoading || isLoginActionPending}
                  type="submit"
                >
                  Log in
                </Button>
              </Stack>
            </form>
            <Group pt="xl">
              <Button
                loading={isGoogleLoading}
                disabled={isGoogleLoading}
                onClick={() => handleLoginWithGoogle()}
              >
                Log in with Google (Popup)
              </Button>
              <Button
                loading={isGoogleUsingRedirectLoading}
                disabled={isGoogleUsingRedirectLoading}
                onClick={() => handleLoginWithGoogleUsingRedirect()}
              >
                Log in with Google (Redirect)
              </Button>
              <Button
                loading={isEmailLinkLoading}
                disabled={isEmailLinkLoading}
                onClick={() => handleLoginWithEmailLink()}
              >
                Log in with Email Link
              </Button>
            </Group>
            <Group>
              <Anchor
                component={Link}
                href={appendRedirectParam('/reset-password', redirect)}
              >
                Reset password
              </Anchor>
              <Button
                component={Link}
                href={appendRedirectParam('/register', redirect)}
                variant="outline"
              >
                Register
              </Button>
            </Group>
          </Stack>
        </Stack>
      </Container>
    </MultiPanelLayout>
  );
}
