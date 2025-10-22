'use client';

import {
  Box,
  Button,
  Card,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import isEqual from 'fast-deep-equal';
import { useRouter } from 'next/navigation';

import { logout } from '@/auth/client/auth';
import { UpdateUserProfileCard } from '@/components/cards/UpdateUserProfileCard';
import { FormActionResult } from '@/components/forms/forms';
import { useActionForm } from '@/components/forms/useActionForm';
import { useAvatarUpload } from '@/components/forms/useAvatarUpload';
import { MultiPanelLayout } from '@/components/layout/MultiPanelLayout';
import { toUrlPath } from '@/datastore/paths';
import { User } from '@/datastore/schema';

import { EditUserOptions } from './edit-user-action';
import { updateUserSchema } from './user-schema';

export interface AccountProps {
  user: User;
  editUserAction: (options: EditUserOptions) => Promise<FormActionResult>;
}

export function Account({ user, editUserAction }: AccountProps) {
  const router = useRouter();

  const { form, handleSubmit, isLoading, submissionError } = useActionForm({
    schema: updateUserSchema,
    initialValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      avatarUrl: user?.avatarUrl ?? '',
      affiliation: user?.affiliation ?? '',
      raceLicenseId: user?.raceLicenseId ?? '',
      address: user?.address ?? '',
    },
    action: (values) => editUserAction({ edits: values }),
    onSuccess: () => {
      router.refresh();
    },
  });

  const { uploading, error, handleFileChange, handleRemovePhoto } =
    useAvatarUpload(form, 'avatarUrl');

  const [debouncedValues] = useDebouncedValue(form.values, 100);

  const topLeft = (
    <Stack>
      <UpdateUserProfileCard
        name={debouncedValues.name}
        email={debouncedValues.email}
        avatarUrl={debouncedValues.avatarUrl}
        uploading={uploading}
        error={error}
        onFileChange={handleFileChange}
        onRemovePhoto={handleRemovePhoto}
      />
      {user && (
        <Button
          variant="outline"
          onClick={() => router.push(`/view/${toUrlPath(user.path)}`)}
        >
          View Public Profile
        </Button>
      )}
      <Button
        variant="outline"
        onClick={async () => {
          await logout();
          router.push('/');
        }}
      >
        Logout
      </Button>
    </Stack>
  );

  const topRight = (
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
        <Button
          type="submit"
          loading={isLoading}
          disabled={!form.isDirty() || !isEqual(form.values, debouncedValues)}
        >
          Save Changes
        </Button>
        {submissionError && <Text c="red">{submissionError}</Text>}
      </Stack>
    </Card>
  );

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <MultiPanelLayout topLeft={topLeft} topRight={topRight} />
    </form>
  );
}
