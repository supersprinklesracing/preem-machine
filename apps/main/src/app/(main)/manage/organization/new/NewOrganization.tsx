'use client';

import { toUrlPath } from '@/datastore/paths';
import type { Organization } from '@/datastore/types';
import {
  Button,
  Card,
  Container,
  Group,
  Stack,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type FormValues = Partial<Organization>;

import { FormActionResult } from '@/components/forms/forms';

export function NewOrganization({
  newOrganizationAction,
}: {
  newOrganizationAction: (
    options: FormValues,
  ) => Promise<FormActionResult<{ path?: string }>>;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    initialValues: {
      name: '',
      website: '',
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
      const result = await newOrganizationAction(values);
      if (result.path) {
        router.push(`/manage/${toUrlPath(result.path)}/edit`);
      }
    } catch (error) {
      console.error('Failed to create organization:', error);
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
        <Title order={1}>Create Organization</Title>
        <Card withBorder>
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack>
              <TextInput
                label="Organization Name"
                required
                {...form.getInputProps('name')}
                data-testid="name-input"
              />
              <TextInput
                label="Website"
                {...form.getInputProps('website')}
                data-testid="website-input"
              />
              <Group justify="right">
                <Button
                  type="submit"
                  loading={isLoading}
                  disabled={!form.isValid()}
                >
                  Create Organization
                </Button>
              </Group>
              {submissionError && <p>{submissionError}</p>}
            </Stack>
          </form>
        </Card>
      </Stack>
    </Container>
  );
}
