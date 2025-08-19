'use client';

import { useAuth } from '@/auth/AuthContext';
import { checkEmailVerification, logout } from '@/auth/client-util';
import UpdateUserProfileCard from '@/components/UpdateUserProfileCard';
import type { FormValues } from '@/components/UserProfileFormFields';
import UserProfileFormFields from '@/components/UserProfileFormFields';
import type { User } from '@/datastore/types';
import { useCurrentUser } from '@/datastore/user/UserContext';
import { getFirebaseAuth } from '@/firebase-client';
import {
  Button,
  Card,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDebouncedValue } from '@mantine/hooks';
import { signOut } from 'firebase/auth';
import Link from 'next/link';
import { unauthorized, useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { useLoadingCallback } from 'react-loading-hook';
import { PreferencesPanel } from './PreferencesPanel';
import { UpdateUserOptions } from './update-user-action';

export function AccountDetails({
  updateUserAction,
}: {
  updateUserAction: (
    options: UpdateUserOptions
  ) => Promise<{ ok: boolean; error?: string }>;
}) {
  const router = useRouter();
  const { authUser } = useAuth();
  const { currentUser } = useCurrentUser();
  const [hasLoggedOut, setHasLoggedOut] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [debouncedNameError, setDebouncedNameError] = useState<ReactNode>(null);

  if (!currentUser) {
    unauthorized();
  }

  const form = useForm<FormValues>({
    initialValues: {
      name: currentUser?.name ?? authUser?.displayName ?? '',
      email: authUser?.email ?? '',
      avatarUrl: currentUser?.avatarUrl ?? authUser?.photoURL ?? '',
      affiliation: currentUser?.affiliation ?? '',
      raceLicenseId: currentUser?.raceLicenseId ?? '',
      address: currentUser?.address ?? '',
      termsAccepted: true,
    },
    validateInputOnChange: false,
    validate: {
      name: (value) =>
        !value || value.trim().length < 2
          ? 'Name must have at least 2 letters'
          : null,
    },
  });

  const [debouncedName] = useDebouncedValue(form.values.name, 500);

  useEffect(() => {
    const result = form.validateField('name');
    setDebouncedNameError(result.error);
  }, [debouncedName, form]);

  const handleSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setSubmissionError(null);

    const user: Partial<User> = {
      name: values.name,
      email: values.email,
      avatarUrl: values.avatarUrl,
    };

    if (values.affiliation) {
      user.affiliation = values.affiliation;
    }
    if (values.raceLicenseId) {
      user.raceLicenseId = values.raceLicenseId;
    }
    if (values.address) {
      user.address = values.address;
    }

    try {
      const path = `users/${currentUser.id}`;
      const result = await updateUserAction({ path, user });
      if (result.ok) {
        router.refresh();
      } else {
        setSubmissionError(result.error || 'An unknown error occurred.');
      }
    } catch (error) {
      console.error('Failed to save user data:', error);
      setSubmissionError(
        error instanceof Error ? error.message : 'An unknown error occurred.'
      );
    } finally {
      setIsLoading(false);
    }
  };

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

  if (!authUser) {
    return null;
  }

  return (
    <Card withBorder style={{ height: '100%' }}>
      <Stack justify="space-between" style={{ height: '100%' }}>
        <Stack>
          <Group justify="space-between">
            <Title order={3}>Account</Title>
            <Button component={Link} href={`/user/${authUser.uid}`} size="xs">
              View My Public Profile
            </Button>
          </Group>
          <SimpleGrid cols={{ base: 1, md: 2 }}>
            <Stack>
              <UpdateUserProfileCard
                name={
                  debouncedName ||
                  currentUser?.name ||
                  authUser.displayName ||
                  'Your full name'
                }
                email={authUser.email ?? undefined}
                avatarUrl={
                  currentUser?.avatarUrl ?? authUser.photoURL ?? undefined
                }
              />
              <Button
                onClick={() => handleSubmit(form.values)}
                loading={isLoading}
                disabled={!form.isValid() || form.values.name !== debouncedName}
              >
                Save Changes
              </Button>
              {submissionError && (
                <Text c="red" size="sm">
                  {submissionError}
                </Text>
              )}
              {!!authUser.customClaims.admin && (
                <Button component={Link} href="/admin">
                  Admin
                </Button>
              )}
              {!authUser.emailVerified && (
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
            <Stack>
              <UserProfileFormFields
                form={form}
                nameError={debouncedNameError}
              />
            </Stack>
          </SimpleGrid>
          <PreferencesPanel />
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
