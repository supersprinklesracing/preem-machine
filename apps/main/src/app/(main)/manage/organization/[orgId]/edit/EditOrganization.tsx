'use client';

import {
  Button,
  Card,
  Group,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { UpdateOrganizationOptions } from './update-organization-action';
import type { ClientCompat, Organization } from '@/datastore/types';

type FormValues = Partial<Organization>;

export function EditOrganization({
  updateOrganizationAction,
  organization,
}: {
  updateOrganizationAction: (
    options: UpdateOrganizationOptions
  ) => Promise<{ ok: boolean; error?: string }>;
  organization: ClientCompat<Organization>;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [submissionError, setSubmissionError] = React.useState<string | null>(
    null
  );

  const form = useForm<FormValues>({
    initialValues: {
      name: organization.name,
    },
    validate: {
      name: (value) =>
        !value || value.trim().length < 2
          ? 'Name must have at least 2 letters'
          : null,
    },
  });

  const handleSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setSubmissionError(null);

    try {
      const result = await updateOrganizationAction({ organization: values });
      if (result.ok) {
        router.refresh();
        router.push(`/manage/${organization.id}`);
      } else {
        setSubmissionError(result.error || 'An unknown error occurred.');
      }
    } catch (error) {
      console.error('Failed to save organization data:', error);
      setSubmissionError(
        error instanceof Error ? error.message : 'An unknown error occurred.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Stack>
      <Title order={1}>Edit Organization</Title>
      <Card withBorder>
        <Stack>
          <TextInput
            label="Organization Name"
            required
            {...form.getInputProps('name')}
          />
          <Group justify="right">
            <Button
              onClick={() => handleSubmit(form.values)}
              loading={isLoading}
              disabled={!form.isValid()}
            >
              Save Changes
            </Button>
          </Group>
          {submissionError && <Text c="red">{submissionError}</Text>}
        </Stack>
      </Card>
    </Stack>
  );
}
