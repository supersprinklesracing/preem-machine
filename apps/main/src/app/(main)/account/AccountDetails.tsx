'use client';

import { useActionForm } from '@/app/shared/hooks/useActionForm';
import { useAuth } from '@/auth/AuthContext';
import { checkEmailVerification, logout } from '@/auth/client-util';
import UpdateUserProfileCard from '@/components/UpdateUserProfileCard';
import { toUrlPath } from '@/datastore/paths';
import { useCurrentUser } from '@/datastore/user/UserContext';
import {
  Alert,
  Box,
  Button,
  Card,
  Container,
  Grid,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconAlertCircle } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { editUserAction } from './edit-user-action';
import { userSchema } from './user-schema';

export default function AccountDetails() {
  const { authUser } = useAuth();
  const { currentUser } = useCurrentUser();
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(true);

  useEffect(() => {
    if (authUser) {
      checkEmailVerification();
    }
  }, [authUser]);

  const { form, handleSubmit, isLoading, submissionError } = useActionForm({
    schema: userSchema,
    initialValues: {
      name: currentUser?.name ?? '',
      email: currentUser?.email ?? '',
      avatarUrl: currentUser?.avatarUrl ?? '',
      affiliation: currentUser?.affiliation ?? '',
      raceLicenseId: currentUser?.raceLicenseId ?? '',
      address: currentUser?.address ?? '',
      termsAccepted: false,
    },
    action: (values) => editUserAction({ path: '', edits: values }),
    onSuccess: () => {
      router.refresh();
    },
  });

  const [debouncedValues] = useDebouncedValue(form.values, 100);

  useEffect(() => {
    if (currentUser) {
      form.setValues({
        name: currentUser.name ?? '',
        email: currentUser.email ?? '',
        avatarUrl: currentUser.avatarUrl ?? '',
        affiliation: currentUser.affiliation ?? '',
        raceLicenseId: currentUser.raceLicenseId ?? '',
        address: currentUser.address ?? '',
      });
    }
  }, [currentUser]);

  if (!currentUser) {
    return <Text>No user data found.</Text>;
  }

  return (
    <Container>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Grid>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack>
              <UpdateUserProfileCard
                name={debouncedValues.name}
                email={debouncedValues.email}
                avatarUrl={debouncedValues.avatarUrl}
              />
              {!isVerified && (
                <Alert
                  variant="light"
                  color="yellow"
                  title="Email not verified"
                  icon={<IconAlertCircle />}
                >
                  Please check your email to verify your account.
                </Alert>
              )}
              <Button type="submit" loading={isLoading}>
                Save Changes
              </Button>
              {submissionError && <Text c="red">{submissionError}</Text>}
              <Button
                variant="outline"
                onClick={() => router.push(toUrlPath(currentUser.path))}
              >
                View Public Profile
              </Button>
              <Button variant="outline" onClick={logout}>
                Logout
              </Button>
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Card withBorder p="lg" radius="md">
              <Stack>
                <Title order={2}>Account Details</Title>
                <Stack gap={0}>
                  <TextInput
                    label="Full Name"
                    placeholder="Your full name"
                    required
                    {...form.getInputProps('name')}
                  />
                  <Box h={22} pt={2}>
                    {form.errors.name && (
                      <Text c="red" size="sm">
                        {form.errors.name}
                      </Text>
                    )}
                  </Box>
                </Stack>
                <TextInput
                  label="Email"
                  placeholder="Your email address"
                  readOnly
                  {...form.getInputProps('email')}
                />
                <TextInput
                  label="Avatar URL"
                  placeholder="URL to your avatar image"
                  {...form.getInputProps('avatarUrl')}
                />
                <TextInput
                  label="Affiliation"
                  placeholder="Your club or team"
                  {...form.getInputProps('affiliation')}
                />
                <TextInput
                  label="Race License ID"
                  placeholder="e.g., 123456"
                  {...form.getInputProps('raceLicenseId')}
                />
                <Textarea
                  label="Address"
                  placeholder="123 Main St, Anytown, USA"
                  {...form.getInputProps('address')}
                />
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>
      </form>
    </Container>
  );
}
