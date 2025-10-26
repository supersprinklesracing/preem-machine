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
import { useState } from 'react';

import { logout } from '@/auth/client/auth';
import { UpdateUserProfileCard } from '@/components/cards/UpdateUserProfileCard';
import { FormActionResult } from '@/components/forms/forms';
import { useActionForm } from '@/components/forms/useActionForm';
import { useAvatarUpload } from '@/components/forms/useAvatarUpload';
import { MultiPanelLayout } from '@/components/layout/MultiPanelLayout';
import { toUrlPath } from '@/datastore/paths';
import { User } from '@/datastore/schema';

import { UpdateUserOptions } from './update-user-action';
import { UpdateUserAvatarOptions } from './update-user-avatar-action';
import { updateUserSchema } from './user-schema';

export interface AccountProps {
  user: User;
  updateUserAction: (options: UpdateUserOptions) => Promise<FormActionResult>;
  updateUserAvatarAction: (
    options: UpdateUserAvatarOptions,
  ) => Promise<FormActionResult>;
}

export function Account({
  user,
  updateUserAction,
  updateUserAvatarAction,
}: AccountProps) {
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? '');

  const { form, handleSubmit, isLoading, submissionError } = useActionForm({
    schema: updateUserSchema,
    initialValues: {
      name: user?.name ?? '',
      address: user?.address ?? '',
    },
    action: (values) => updateUserAction({ edits: values }),
    onSuccess: () => {
      router.refresh();
    },
  });

  const { uploading, error, handleFileChange, handleRemovePhoto } =
    useAvatarUpload({
      onUpload: async (url) => {
        try {
          await updateUserAvatarAction({ edits: { avatarUrl: url } });
          setAvatarUrl(url);
          router.refresh();
        } catch (e) {
          // TODO: handle error
        }
      },
      onRemove: async () => {
        try {
          await updateUserAvatarAction({ edits: { avatarUrl: '' } });
          setAvatarUrl('');
          router.refresh();
        } catch (e) {
          // TODO: handle error
        }
      },
    });

  const [debouncedFormValues] = useDebouncedValue(form.values, 100);

  const topLeft = (
    <Stack>
      <UpdateUserProfileCard
        name={debouncedFormValues.name}
        avatarUrl={avatarUrl}
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
        <Textarea
          id="address"
          label="Address"
          placeholder="123 Main St, Anytown, USA"
          {...form.getInputProps('address')}
        />
        <Button
          type="submit"
          loading={isLoading}
          disabled={
            !form.isDirty() || !isEqual(form.values, debouncedFormValues)
          }
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
