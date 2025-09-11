'use client';

import { useActionForm } from '@/app/shared/hooks/useActionForm';
import OrganizationCard from '@/components/cards/OrganizationCard';
import { FormActionResult } from '@/components/forms/forms';
import { toUrlPath } from '@/datastore/paths';
import { Organization } from '@/datastore/schema';
import {
  Button,
  Card,
  Container,
  Group,
  SimpleGrid,
  Stack,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import isEqual from 'fast-deep-equal';
import { useRouter } from 'next/navigation';
import { organizationSchema } from '../organization-schema';
import { NewOrganizationOptions } from './new-organization-action';

export function NewOrganization({
  newOrganizationAction,
}: {
  newOrganizationAction: (
    options: NewOrganizationOptions,
  ) => Promise<FormActionResult<{ path?: string }>>;
}) {
  const router = useRouter();

  const { form, handleSubmit, isLoading, submissionError } = useActionForm({
    schema: organizationSchema,
    initialValues: {
      name: '',
      website: '',
      description: '',
    },
    action: (values) => newOrganizationAction({ values }),
    onSuccess: (result) => {
      if (result.path) {
        router.push(`/manage/${toUrlPath(result.path)}/edit`);
      }
    },
  });

  const [debouncedValues] = useDebouncedValue(form.values, 100);

  const organizationPreview: Organization = {
    id: 'preview',
    path: 'organizations/preview',
    name: debouncedValues.name || 'Your Organization Name',
    description: debouncedValues.description,
    website: debouncedValues.website,
  };

  return (
    <Container>
      <Stack>
        <Title order={1}>Create Organization</Title>
        <SimpleGrid cols={{ base: 1, md: 2 }}>
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
                <Textarea
                  label="Description"
                  {...form.getInputProps('description')}
                  data-testid="description-input"
                />
                <Group justify="right">
                  <Button
                    type="submit"
                    loading={isLoading}
                    disabled={
                      !form.isValid() || !isEqual(form.values, debouncedValues)
                    }
                  >
                    Create Organization
                  </Button>
                </Group>
                {submissionError && <p>{submissionError}</p>}
              </Stack>
            </form>
          </Card>
          <OrganizationCard organization={organizationPreview} />
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
