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
import { useLoadingCallback } from 'react-loading-hook';

import { MultiPanelLayout } from '@/components/layout/MultiPanelLayout';

import { resendVerificationEmail } from './verify-email-action';

export function VerifyEmail() {
  const [handleResendEmail, isResending, resendError] =
    useLoadingCallback(async () => {
      await resendVerificationEmail();
      // Optionally, show a success message to the user.
      alert('A new verification email has been sent.');
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
          {resendError && <Text c="red">{resendError.message}</Text>}
          <Group>
            <Button
              loading={isResending}
              disabled={isResending}
              onClick={handleResendEmail}
            >
              Resend verification email
            </Button>
          </Group>
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