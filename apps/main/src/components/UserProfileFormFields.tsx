'use client';

import type { User } from '@/datastore/types';
import { Box, Card, Stack, Text, TextInput, Textarea } from '@mantine/core';
import { useForm } from '@mantine/form';

export interface FormValues extends Partial<User> {
  termsAccepted: boolean;
}

const FormFields = ({
  form,
  nameError,
}: {
  form: ReturnType<typeof useForm<FormValues>>;
  nameError: React.ReactNode;
}) => {
  return (
    <Card withBorder padding="lg" radius="md" style={{ height: '100%' }}>
      <Stack>
        <Stack gap={0}>
          <TextInput
            label="Full Name"
            placeholder="Your full name"
            required
            {...form.getInputProps('name')}
            error={!!nameError}
          />
          <Box h={22} pt={2}>
            {nameError && (
              <Text c="red" size="sm">
                {nameError}
              </Text>
            )}
          </Box>
        </Stack>
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
};

export default FormFields;
