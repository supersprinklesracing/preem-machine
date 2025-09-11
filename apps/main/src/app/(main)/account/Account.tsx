'use client';

import { useActionForm } from '@/app/shared/hooks/useActionForm';
import { logout } from '@/auth/client-util';
import { FormActionResult } from '@/components/forms/forms';
import UpdateUserProfileCard from '@/components/UpdateUserProfileCard';
import { toUrlPath } from '@/datastore/paths';
import { User } from '@/datastore/schema';
import {
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
import { useRouter } from 'next/navigation';
import { EditUserOptions } from './edit-user-action';
import { userSchema } from './user-schema';

export interface AccountProps {
  currentUser: User;
  editUserAction: (options: EditUserOptions) => Promise<FormActionResult>;
}

export default function Account({ currentUser, editUserAction }: AccountProps) {
  const router = useRouter();

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
    action: (values) =>
      editUserAction({ path: currentUser.path, edits: values }),
    onSuccess: () => {
      router.refresh();
    },
  });

  const [debouncedValues] = useDebouncedValue(form.values, 100);

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
              <Button type="submit" loading={isLoading}>
                Save Changes
              </Button>
              {submissionError && <Text c="red">{submissionError}</Text>}
              {currentUser && (
                <Button
                  variant="outline"
                  onClick={() => router.push(toUrlPath(currentUser.path))}
                >
                  View Public Profile
                </Button>
              )}
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
                    id="name"
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
                  id="email"
                  label="Email"
                  placeholder="Your email address"
                  readOnly
                  {...form.getInputProps('email')}
                />
                <TextInput
                  id="avatarUrl"
                  label="Avatar URL"
                  placeholder="URL to your avatar image"
                  {...form.getInputProps('avatarUrl')}
                />
                <TextInput
                  id="affiliation"
                  label="Affiliation"
                  placeholder="Your club or team"
                  {...form.getInputProps('affiliation')}
                />
                <TextInput
                  id="raceLicenseId"
                  label="Race License ID"
                  placeholder="e.g., 123456"
                  {...form.getInputProps('raceLicenseId')}
                />
                <Textarea
                  id="address"
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
