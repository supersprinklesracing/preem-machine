'use client';

import type { ClientCompat, Organization } from '@/datastore/types';
import {
  Button,
  Card,
  Container,
  Group,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { StripeConnectCard } from './StripeConnectCard';
import { EditOrganizationOptions } from './edit-organization-action';

type FormValues = EditOrganizationOptions['edits'];

import { FormActionResult } from '@/components/forms/forms';

export function EditOrganization({
  editOrganizationAction,
  organization,
  stripeError,
}: {
  editOrganizationAction: (
    options: EditOrganizationOptions,
  ) => Promise<FormActionResult>;
  organization: ClientCompat<Organization>;
  stripeError?: string;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    initialValues: {
      name: organization.name ?? '',
      website: organization.website ?? '',
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
      const path = organization.path;
      await editOrganizationAction({
        path,
        edits: values,
      });
      router.refresh();
    } catch (error) {
      console.error('Failed to save organization data:', error);
      setSubmissionError(
        error instanceof Error ? error.message : 'An unknown error occurred.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container size="xs">
      <Stack>
        <Title order={1}>Edit Organization</Title>
        <Card withBorder>
          <Stack>
            <TextInput
              label="Organization Name"
              required
              {...form.getInputProps('name')}
            />
            <TextInput label="Website" {...form.getInputProps('website')} />
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
        <StripeConnectCard
          organization={organization}
          stripeError={stripeError}
        />
      </Stack>
    </Container>
  );
}
