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
  UserCredential,
  getRedirectResult,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailAndPassword,
  signInWithEmailLink,
} from 'firebase/auth';
import Link from 'next/link';
import * as React from 'react';
import { useLoadingCallback } from 'react-loading-hook';
import { loginWithCredential } from '../auth';
import { getFirebaseAuth } from '../auth/firebase';
import { appendRedirectParam } from '../shared/redirect';
import { useRedirectAfterLogin } from '../shared/useRedirectAfterLogin';
import { useRedirectParam } from '../shared/useRedirectParam';
import {
  getGoogleProvider,
  loginWithProvider,
  loginWithProviderUsingRedirect,
} from './firebase';

const auth = getFirebaseAuth();

export function LoginPage({
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

  async function handleLogin(credential: UserCredential) {
    await loginWithCredential(credential);
    redirectAfterLogin();
  }

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
          await signInWithEmailAndPassword(auth, email, password)
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

  async function handleLoginWithRedirect() {
    const credential = await getRedirectResult(auth);

    if (credential?.user) {
      await handleLogin(credential);

      setHasLogged(true);
    }
  }

  React.useEffect(() => {
    handleLoginWithRedirect();
  }, []);

  const [handleLoginWithEmailLink, isEmailLinkLoading, emailLinkError] =
    useLoadingCallback(async () => {
      const auth = getFirebaseAuth();
      const email = window.prompt('Please provide your email');

      if (!email) {
        return;
      }

      window.localStorage.setItem('emailForSignIn', email);

      await sendSignInLinkToEmail(auth, email, {
        url: process.env.NEXT_PUBLIC_ORIGIN + '/login',
        handleCodeInApp: true,
      });
    });

  async function handleLoginWithEmailLinkCallback() {
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
      await signInWithEmailLink(auth, email, window.location.href)
    );
    window.localStorage.removeItem('emailForSignIn');

    setHasLogged(true);
  }

  React.useEffect(() => {
    handleLoginWithEmailLinkCallback();
  }, []);

  const error =
    emailPasswordError ||
    googleError ||
    emailLinkError ||
    googleUsingRedirectError;

  return (
    <Container size="xs" pt="xl">
      <Stack>
        <Title order={1}>Login</Title>
        {hasLogged && (
          <Group>
            <Text>
              Redirecting to <strong>{redirect || '/'}</strong>
            </Text>
            <Loader />
          </Group>
        )}
        {!hasLogged && (
          <form onSubmit={handleLoginWithEmailAndPassword}>
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
              {!process.env.VERCEL && (
                <Switch
                  checked={shouldLoginWithAction}
                  onChange={(event) =>
                    setShouldLoginWithAction(event.currentTarget.checked)
                  }
                  label="Login with Server Action"
                />
              )}
              {error && <Text c="red">{error.message}</Text>}
              <Button
                loading={isEmailLoading || isLoginActionPending}
                disabled={isEmailLoading || isLoginActionPending}
                type="submit"
              >
                Submit
              </Button>
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
            </Stack>
          </form>
        )}
      </Stack>
    </Container>
  );
}
