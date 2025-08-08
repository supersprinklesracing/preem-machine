import Link from 'next/link';
import { Button, Title, Badge, Card, Stack, Group } from '@mantine/core';

export async function generateStaticParams() {
  return [{}];
}

export default function Home() {
  return (
    <Stack>
      <Title order={1}>
        <Group>
          <span>Home</span>
          <Badge>Static</Badge>
        </Group>
      </Title>
      <Card>
        <Link href="/profile">
          <h2>You are logged in</h2>
          <Button style={{ marginBottom: 0 }}>Go to profile page</Button>
        </Link>
      </Card>
    </Stack>
  );
}
