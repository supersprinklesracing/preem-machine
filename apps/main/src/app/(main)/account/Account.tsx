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
import Link from 'next/link';
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
    <Card withBorder style={{ height: '100%' }}>
      <Stack justify="space-between" style={{ height: '100%' }}>
        <Stack>
          <Title order={3}>Account</Title>
          <Stack align="center" gap="xs">
            <Avatar src={user.photoURL} size="xl" radius="50%" />
            <Title order={4}>{user.displayName}</Title>
            <Group>
              <Text c="dimmed">{user.email}</Text>
              {user.emailVerified ? (
                <Badge color="green">Email verified</Badge>
              ) : (
                <Badge color="red">Not verified</Badge>
              )}
            </Group>
          </Stack>

          <Button component={Link} href={`/user/${user.uid}`}>
            View My Public Profile
          </Button>

          {!!user.customClaims.admin && (
            <Button component={Link} href="/admin">
              Admin
            </Button>
          )}

          {!user.emailVerified && (
            <Button
              loading={isReCheckLoading}
              disabled={isReCheckLoading}
              onClick={handleReCheck}
              size="xs"
              variant="outline"
            >
              Verify Email
            </Button>
          )}
        </Stack>

        <Button
          loading={isLogoutLoading || hasLoggedOut}
          disabled={isLogoutLoading || hasLoggedOut}
          onClick={handleLogout}
          variant="outline"
        >
          Log out
        </Button>
      </Stack>
    </Card>
  );
}
