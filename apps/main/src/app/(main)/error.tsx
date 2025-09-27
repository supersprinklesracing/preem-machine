'use client';

import { Button, Container, Title, Text, Group } from '@mantine/core';
import { AuthError } from '@/auth/errors';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  if (error instanceof AuthError && error.status === 401) {
    return (
      <Container>
        <Title>401 - Unauthorized</Title>
        <Text>You are not authorized to view this page.</Text>
        <Group>
          <Button component={Link} href="/login">
            Login
          </Button>
        </Group>
      </Container>
    );
  }

  return (
    <Container>
      <Title>Something went wrong!</Title>
      <Text>{error.message}</Text>
      <Group>
        <Button onClick={() => reset()}>Try again</Button>
      </Group>
    </Container>
  );
}
