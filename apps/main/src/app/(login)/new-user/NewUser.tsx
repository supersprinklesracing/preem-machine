'use client';

import { useActionForm } from '@/app/shared/hooks/useActionForm';
import { useAuth } from '@/auth/AuthContext';
import UserProfileCard from '@/components/UpdateUserProfileCard';
import { FormActionResult } from '@/components/forms/forms';
import {
  Box,
  Button,
  Card,
  Checkbox,
  Container,
  Grid,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { redirect, useRouter } from 'next/navigation';
import { NewUserOptions } from './new-user-action';
import { userSchema } from '@/app/(main)/account/user-schema';

export default function NewUser({
  newUserAction,
  onSuccess,
}: {
  newUserAction: ({ values }: NewUserOptions) => Promise<FormActionResult>;
  onSuccess?: () => void;
}) {
  const { authUser } = useAuth();
  const router = useRouter();

  if (!authUser) {
    redirect('/login');
  }

  const { form, handleSubmit, isLoading, submissionError } = useActionForm({
    schema: userSchema,
    initialValues: {
      name: authUser.displayName ?? '',
      email: authUser.email ?? '',
      avatarUrl: authUser.photoURL ?? '',
      termsAccepted: true,
      affiliation: '',
      raceLicenseId: '',
      address: '',
    },
    action: (values) => {
      return newUserAction({ values });
    },
    onSuccess: () => {
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/');
      }
    },
  });

  const [debouncedName] = useDebouncedValue(form.values.name, 100);

  return (
    <Container size="md" pt="xl">
      <Title order={1}>Complete Your Profile</Title>
      <Text c="dimmed" mb="xl">
        Welcome! Please fill out the details below to get started.
      </Text>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Grid>
          <Grid.Col span={{ base: 12, lg: 4 }}>
            <Stack>
              <UserProfileCard
                name={debouncedName || authUser.displayName || 'Your full name'}
                email={authUser.email ?? undefined}
                avatarUrl={authUser.photoURL ?? undefined}
              />
              <Checkbox
                mt="md"
                label="I agree to the Terms and Conditions"
                {...form.getInputProps('termsAccepted', { type: 'checkbox' })}
              />
              <Button
                type="submit"
                mt="sm"
                loading={isLoading}
                disabled={!form.isValid() || form.values.name !== debouncedName}
              >
                Save and Continue
              </Button>
              <Box h={24}>
                {submissionError && (
                  <Text c="red" size="sm" mt="sm">
                    {submissionError}
                  </Text>
                )}
              </Box>
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ lg: 8 }}>
            <Card
              withBorder
              padding="lg"
              radius="md"
              style={{ height: '100%' }}
            >
              <Stack>
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
                  readOnly
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
