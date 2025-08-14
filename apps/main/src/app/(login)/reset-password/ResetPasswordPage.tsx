'use client';

import { Button, Stack, Text, TextInput, Title } from '@mantine/core';
import { sendPasswordResetEmail } from 'firebase/auth';
import Link from 'next/link';
import * as React from 'react';
import { useLoadingCallback } from 'react-loading-hook';
import { getFirebaseAuth } from '@/auth/firebase';
import { appendRedirectParam } from '@/app/shared/redirect';
import { useRedirectParam } from '@/app/shared/useRedirectParam';

export function ResetPasswordPage() {
  const [email, setEmail] = React.useState('');
  const [isSent, setIsSent] = React.useState(false);
  const redirect = useRedirectParam();
  const [sendResetInstructions, loading, error] = useLoadingCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      event.stopPropagation();

      const auth = getFirebaseAuth();
      setIsSent(false);
      await sendPasswordResetEmail(auth, email);
      setEmail('');
      setIsSent(true);
    }
  );

  return (
    <Stack>
      <Title order={1}>Reset password</Title>
      <form onSubmit={sendResetInstructions}>
        <Stack>
          <TextInput
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            name="email"
            type="email"
            placeholder="Email address"
          />
          {isSent && <Text>Instructions sent. Check your email.</Text>}
          {error && <Text c="red">{error.message}</Text>}
          <Button
            loading={loading}
            disabled={loading}
            variant="filled"
            type="submit"
          >
            Send reset instructions
          </Button>
          <Button
            component={Link}
            href={appendRedirectParam('/login', redirect)}
            disabled={loading}
            variant="outline"
          >
            Back to login
          </Button>
        </Stack>
      </form>
    </Stack>
  );
}
