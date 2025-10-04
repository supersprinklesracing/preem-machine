'use client';

import {
  Anchor,
  Button,
  Container,
  Group,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import Link from 'next/link';
import * as React from 'react';
import { z } from 'zod';

import { useActionForm } from '@/components/forms/useActionForm';
import { MultiPanelLayout } from '@/components/layout/MultiPanelLayout';

import { resendVerificationEmail } from './verify-email-action';

export function VerifyEmail() {
  const [success, setSuccess] = React.useState(false);
  const { form, handleSubmit, isLoading, submissionError } = useActionForm({
    schema: z.object({}),
    initialValues: {},
    action: async () => await resendVerificationEmail(),
    onSuccess: () => {
      setSuccess(true);
    },
  });

  return (
    <MultiPanelLayout>
      <Container size="md" pt="xl">
        <Stack>
          <Title order={1}>Verify Your Email</Title>
          <Text>
            Before you can log in, you need to verify your email address. We've
            sent a verification link to your registered email. Please check
            your inbox and click the link to continue.
          </Text>
          <Text>
            If you haven't received the email, you can request a new one.
          </Text>
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Group>
              <Button
                type="submit"
                loading={isLoading}
                disabled={isLoading}
              >
                Resend verification email
              </Button>
            </Group>
          </form>
          {submissionError && <Text c="red">{submissionError}</Text>}
          {success && (
            <Text c="green">A new verification email has been sent.</Text>
          )}
          <Group>
            <Anchor component={Link} href="/login">
              Back to Login
            </Anchor>
          </Group>
        </Stack>
      </Container>
    </MultiPanelLayout>
  );
}