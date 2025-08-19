'use client';

import { useAuth } from '@/auth/AuthContext';
import type { User } from '@/datastore/types';
import {
  Box,
  Button,
  Checkbox,
  Container,
  Grid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDebouncedValue } from '@mantine/hooks';
import { redirect, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import FormFields, { FormValues } from './NewUserFormFields';
import type { NewUserOptions } from './new-user-action';

interface Props {
  newUserAction: (
    options: NewUserOptions
  ) => Promise<{ ok: boolean; error?: string }>;
}

import UserProfileCard from './NewUserProfileCard';

const NewUser: React.FC<Props> = ({ newUserAction }: Props) => {
  const { authUser } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [nameError, setDebouncedNameError] = useState<React.ReactNode>(null);

  if (!authUser) {
    redirect('/login');
  }

  const form = useForm<FormValues>({
    initialValues: {
      name: authUser.displayName ?? 'Your full name',
      email: authUser.email ?? undefined,
      avatarUrl: authUser.photoURL ?? undefined,
      termsAccepted: true,
    },
    validateInputOnChange: false,
    validate: {
      name: (value) =>
        !value || value.trim().length < 2
          ? 'Name must have at least 2 letters'
          : null,
      termsAccepted: (value) =>
        !value ? 'You must accept the terms and conditions' : null,
    },
  });

  const [debouncedName] = useDebouncedValue(form.values.name, 500);

  useEffect(() => {
    const result = form.validateField('name');
    setDebouncedNameError(result.error);
  }, [debouncedName, form]);

  const handleSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setSubmissionError(null);

    const userUpdate: Partial<User> = {
      name: values.name,
      email: values.email,
      avatarUrl: values.avatarUrl,
    };

    if (values.affiliation) {
      userUpdate.affiliation = values.affiliation;
    }
    if (values.raceLicenseId) {
      userUpdate.raceLicenseId = values.raceLicenseId;
    }
    if (values.address) {
      userUpdate.address = values.address;
    }

    try {
      const result = await newUserAction({ user: userUpdate });
      if (result.ok) {
        router.push('/');
      } else {
        setSubmissionError(result.error || 'An unknown error occurred.');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Failed to save user data:', error);
      setSubmissionError(
        error instanceof Error ? error.message : 'An unknown error occurred.'
      );
      setIsLoading(false);
    }
  };

  return (
    <Container size="md" pt="xl">
      <Title order={1}>Complete Your Profile</Title>
      <Text c="dimmed" mb="xl">
        Welcome! Please fill out the details below to get started.
      </Text>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Grid>
          <Grid.Col span={{ base: 12, lg: 4 }}>
            <Stack>
              <UserProfileCard {...form.getValues()} name={debouncedName} />

              <Box display={{ base: 'block', lg: 'none' }} mt="md">
                <FormFields form={form} nameError={nameError} />
              </Box>

              <Checkbox
                mt="md"
                label="I agree to the Terms and Conditions"
                {...form.getInputProps('termsAccepted', { type: 'checkbox' })}
              />
              <Button
                type="submit"
                mt="sm"
                loading={isLoading}
                disabled={!form.isValid() || form.values.name !== debouncedName}
              >
                Save and Continue
              </Button>
              <Box h={24}>
                {submissionError && (
                  <Text c="red" size="sm" mt="sm">
                    {submissionError}
                  </Text>
                )}
              </Box>
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ lg: 8 }} visibleFrom="lg">
            <FormFields form={form} nameError={nameError} />
          </Grid.Col>
        </Grid>
      </form>
    </Container>
  );
};

export default NewUser;
