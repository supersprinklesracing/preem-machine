'use client';

import {
  Box,
  Button,
  Card,
  Checkbox,
  Container,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import isEqual from 'fast-deep-equal';
import { redirect, useRouter } from 'next/navigation';

import { newUserSchema } from '@/app/(main)/account/user-schema';
import { UpdateUserProfileCard } from '@/components/cards/UpdateUserProfileCard';
import { FormActionResult } from '@/components/forms/forms';
import { useActionForm } from '@/components/forms/useActionForm';
import { useAvatarUpload } from '@/components/forms/useAvatarUpload';
import { MultiPanelLayout } from '@/components/layout/MultiPanelLayout';
import { toUrlPath } from '@/datastore/paths';
import { useUserContext } from '@/user/client/UserContext';

import { NewUserOptions } from './new-user-action';

export function NewUser({
  newUserAction,
  onSuccess,
}: {
  newUserAction: (
    options: NewUserOptions,
  ) => Promise<FormActionResult<{ path: string }>>;
  onSuccess?: () => void;
}) {
  const { authUser } = useUserContext();
  const router = useRouter();

  if (!authUser) {
    redirect('/login');
  }

  const { form, handleSubmit, isLoading, submissionError } = useActionForm({
    schema: newUserSchema,
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
    onSuccess: (data) => {
      if (onSuccess) {
        onSuccess();
      } else if (data?.path) {
        router.push(`/view/${toUrlPath(data.path)}`);
      } else {
        router.push('/');
      }
    },
  });

  const { uploading, error, handleFileChange, handleRemovePhoto } =
    useAvatarUpload({
      onUpload: (url) => {
        form.setFieldValue('avatarUrl', url);
      },
      onRemove: () => {
        form.setFieldValue('avatarUrl', '');
      },
    });

  const [debouncedValues] = useDebouncedValue(form.values, 100);

  const topLeft = (
    <Stack>
      <UpdateUserProfileCard
        name={
          debouncedValues.name || authUser.displayName || 'Your full name'
        }
        email={authUser.email ?? undefined}
        avatarUrl={form.values.avatarUrl ?? undefined}
        uploading={uploading}
        error={error}
        onFileChange={handleFileChange}
        onRemovePhoto={handleRemovePhoto}
      />
      <Checkbox
        mt="md"
        label="I agree to the Terms and Conditions"
        {...form.getInputProps('termsAccepted', {
          type: 'checkbox',
        })}
      />
      <Button
        type="submit"
        mt="sm"
        loading={isLoading}
        disabled={!form.isValid() || !isEqual(form.values, debouncedValues)}
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
  );

  const topRight = (
    <Card withBorder padding="lg" radius="md" style={{ height: '100%' }}>
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
  );

  return (
    <Container size="md" pt="xl">
      <Title order={1}>Complete Your Profile</Title>
      <Text c="dimmed" mb="xl">
        Welcome! Please fill out the details below to get started.
      </Text>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <MultiPanelLayout topLeft={topLeft} topRight={topRight} />
      </form>
    </Container>
  );
}
