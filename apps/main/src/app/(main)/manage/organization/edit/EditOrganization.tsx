'use client';

import {
  Button,
  Card,
  Group,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import isEqual from 'fast-deep-equal';
import { useRouter } from 'next/navigation';

import { OrganizationCard } from '@/components/cards/OrganizationCard';
import { FormActionResult } from '@/components/forms/forms';
import { useActionForm } from '@/components/forms/useActionForm';
import { MultiPanelLayout } from '@/components/layout/MultiPanelLayout';
import { Organization } from '@/datastore/schema';

import { organizationSchema } from '../organization-schema';
import { EditOrganizationOptions } from './edit-organization-action';
import { StripeConnectCard } from './StripeConnectCard';

export function EditOrganization({
  editOrganizationAction,
  organization,
  stripeError,
}: {
  editOrganizationAction: (
    options: EditOrganizationOptions,
  ) => Promise<FormActionResult>;
  organization: Pick<
    Organization,
    'path' | 'name' | 'website' | 'description' | 'id' | 'stripe'
  >;
  stripeError?: string;
}) {
  const router = useRouter();

  const { form, handleSubmit, isLoading, submissionError } = useActionForm({
    schema: organizationSchema,
    initialValues: {
      name: organization.name ?? '',
      website: organization.website ?? '',
      description: organization.description ?? '',
    },
    action: (values) =>
      editOrganizationAction({ path: organization.path, edits: values }),
    onSuccess: () => {
      router.refresh();
    },
  });

  const [debouncedValues] = useDebouncedValue(form.values, 100);

  const organizationPreview: Organization = {
    ...organization,
    name: debouncedValues.name,
    website: debouncedValues.website,
    description: debouncedValues.description,
  };

  return (
    <Stack>
      <Title order={1}>Edit Organization</Title>
      <MultiPanelLayout
        topLeft={
          <Stack>
            <Card withBorder>
              <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack>
                  <TextInput
                    label="Organization Name"
                    required
                    {...form.getInputProps('name')}
                  />
                  <TextInput
                    label="Website"
                    {...form.getInputProps('website')}
                  />
                  <Textarea
                    label="Description"
                    {...form.getInputProps('description')}
                  />
                  <Group justify="right">
                    <Button
                      type="submit"
                      loading={isLoading}
                      disabled={
                        !form.isValid() ||
                        !isEqual(form.values, debouncedValues)
                      }
                    >
                      Save Changes
                    </Button>
                  </Group>
                  {submissionError && <Text c="red">{submissionError}</Text>}
                </Stack>
              </form>
            </Card>
            <StripeConnectCard
              organization={organization}
              stripeError={stripeError}
            />
          </Stack>
        }
        topRight={<OrganizationCard organization={organizationPreview} />}
      />
    </Stack>
  );
}
