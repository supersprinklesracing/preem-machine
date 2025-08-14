'use server';

import { Badge, Group, Stack, Title } from '@mantine/core';

export async function generateStaticParams() {
  return [{}];
}

export default async function Home() {
  return (
    <Stack>
      <Title order={1}>
        <Group>
          <span>Home</span>
          <Badge>Static</Badge>
        </Group>
      </Title>
    </Stack>
  );
}
