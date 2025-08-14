'use client';

import { useAuth } from '@/auth/AuthContext';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Group,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useLoadingCallback } from 'react-loading-hook';
import { checkEmailVerification, logout } from '@/auth';
import { getFirebaseAuth } from '@/auth/firebase';

export function Account() {
  const router = useRouter();
  const { user } = useAuth();
  const [hasLoggedOut, setHasLoggedOut] = React.useState(false);
  const [handleLogout, isLogoutLoading] = useLoadingCallback(async () => {
    const auth = getFirebaseAuth();
    await signOut(auth);
    await logout();

    router.refresh();

    setHasLoggedOut(true);
  });

  const [handleReCheck, isReCheckLoading] = useLoadingCallback(async () => {
    await checkEmailVerification();
    router.refresh();
  });

  if (!user) {
    return null;
  }

  return (
    <Card withBorder>
      <Stack>
        <Title order={3}>Account</Title>
        <Group>
          <Avatar src={user.photoURL} />
          <Text>{user.email}</Text>
        </Group>

        {user.emailVerified ? (
          <Badge color="green">Email verified</Badge>
        ) : (
          <Group>
            <Badge color="red">Email not verified.</Badge>
            <Button
              loading={isReCheckLoading}
              disabled={isReCheckLoading}
              onClick={handleReCheck}
            >
              Re-check
            </Button>
          </Group>
        )}

        <Button
          loading={isLogoutLoading || hasLoggedOut}
          disabled={isLogoutLoading || hasLoggedOut}
          onClick={handleLogout}
        >
          Log out
        </Button>
      </Stack>
    </Card>
  );
}
