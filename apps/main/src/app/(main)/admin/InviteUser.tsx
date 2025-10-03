'use client';

import { Button, Select, Stack, Text, TextInput, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';

import { useActionForm } from '@/components/forms/useActionForm';
import { Organization } from '@/datastore/schema';

import { inviteSchema } from './invite-schema';
import { inviteUser as inviteUserAction } from './invite-user-action';

interface InviteUserProps {
  organizations: Organization[];
  inviteUserAction: typeof inviteUserAction;
}

export function InviteUser({
  organizations,
  inviteUserAction,
}: InviteUserProps) {
  const { form, handleSubmit, isLoading, submissionError } = useActionForm({
    schema: inviteSchema,
    initialValues: {
      email: '',
      organizationRefs: [],
    },
    action: async (values) => {
      await inviteUserAction({ edits: values });
    },
    onSuccess: () => {
      notifications.show({
        title: 'Invitation sent',
        message: `An invitation has been sent to ${form.values.email}`,
        color: 'green',
      });
      form.reset();
    },
  });

  const organizationData = organizations.map((org) => ({
    value: org.path,
    label: org.name,
  }));

  return (
    <Stack>
      <Title order={2}>Invite User</Title>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput
            withAsterisk
            label="Email"
            placeholder="user@example.com"
            {...form.getInputProps('email')}
            data-testid="email-input"
          />
          <Select
            withAsterisk
            label="Organization"
            placeholder="Select an organization"
            data={organizationData}
            value={form.values.organizationRefs[0]?.path ?? null}
            onChange={(value) => {
              const org = organizations.find((o) => o.path === value);
              if (org) {
                form.setFieldValue('organizationRefs', [
                  { id: org.id, path: org.path },
                ]);
              } else {
                form.setFieldValue('organizationRefs', []);
              }
            }}
            error={form.errors.organizationRefs}
            data-testid="organization-refs-input"
          />
          <Button type="submit" loading={isLoading} disabled={!form.isValid()}>
            Send Invitation
          </Button>
          {submissionError && <Text c="red">{submissionError}</Text>}
        </Stack>
      </form>
    </Stack>
  );
}
