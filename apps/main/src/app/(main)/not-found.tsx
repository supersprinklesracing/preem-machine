'use client';

import { Button, Container, Title, Text, Group } from '@mantine/core';
import Link from 'next/link';

export default function NotFound() {
  return (
    <Container>
      <Title>404 - Page Not Found</Title>
      <Text>The page you are looking for does not exist.</Text>
      <Group>
        <Button component={Link} href="/">
          Go back to the home page
        </Button>
      </Group>
    </Container>
  );
}
