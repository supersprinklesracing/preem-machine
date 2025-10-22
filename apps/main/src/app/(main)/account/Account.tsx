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
import imageCompression from 'browser-image-compression';
import isEqual from 'fast-deep-equal';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { generateSignedUploadUrl } from '@/app/(main)/account/upload-action';
import { logout } from '@/auth/client/auth';
import { UpdateUserProfileCard } from '@/components/cards/UpdateUserProfileCard';
import { FormActionResult } from '@/components/forms/forms';
import { useActionForm } from '@/components/forms/useActionForm';
import { MultiPanelLayout } from '@/components/layout/MultiPanelLayout';
import { toUrlPath } from '@/datastore/paths';
import { User } from '@/datastore/schema';
import { ENV_MAX_IMAGE_SIZE_BYTES } from '@/env/env';

import { EditUserOptions } from './edit-user-action';
import { UpdateAvatarOptions } from './update-avatar-action';
import { updateUserSchema } from './user-schema';

export interface AccountProps {
  user: User;
  editUserAction: (options: EditUserOptions) => Promise<FormActionResult>;
  updateAvatarAction: (
    options: UpdateAvatarOptions,
  ) => Promise<FormActionResult>;
}

export function Account({
  user,
  editUserAction,
  updateAvatarAction,
}: AccountProps) {
  const router = useRouter();

  const { form, handleSubmit, isLoading, submissionError } = useActionForm({
    schema: updateUserSchema,
    initialValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      affiliation: user?.affiliation ?? '',
      raceLicenseId: user?.raceLicenseId ?? '',
      address: user?.address ?? '',
    },
    action: (values) => editUserAction({ edits: values }),
    onSuccess: () => {
      router.refresh();
    },
  });

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (file: File | null) => {
    if (!file) return;

    if (file.size > ENV_MAX_IMAGE_SIZE_BYTES) {
      setError(
        `File is too large. Maximum size is ${
          ENV_MAX_IMAGE_SIZE_BYTES / 1024 / 1024
        }MB.`,
      );
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const compressedFile = await imageCompression(file, {
        maxSizeMB: ENV_MAX_IMAGE_SIZE_BYTES / 1024 / 1024,
        maxWidthOrHeight: 256,
        useWebWorker: true,
      });

      const { signedUrl, publicUrl } = await generateSignedUploadUrl({
        contentType: compressedFile.type,
      });

      const response = await fetch(signedUrl, {
        method: 'PUT',
        body: compressedFile,
        headers: {
          'Content-Type': compressedFile.type,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to upload file.');
      }

      await updateAvatarAction({ edits: { avatarUrl: publicUrl } });
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unknown error occurred',
      );
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    await updateAvatarAction({ edits: { avatarUrl: '' } });
    router.refresh();
  };

  const [debouncedValues] = useDebouncedValue(form.values, 100);

  const topLeft = (
    <Stack>
      <UpdateUserProfileCard
        name={debouncedValues.name}
        email={debouncedValues.email}
        avatarUrl={user.avatarUrl}
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
