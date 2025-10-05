'use client';

import { Anchor, Button, Card, Group, Text } from '@mantine/core';
import Link from 'next/link';

import { User } from '@/datastore/schema';

interface AdminUserCardProps {
  user: User;
  onEdit: () => void;
  onMakeAdmin: () => void;
}

export function AdminUserCard({
  user,
  onEdit,
  onMakeAdmin,
}: AdminUserCardProps) {
  return (
    <Card withBorder padding="lg" radius="md">
      <Group justify="space-between">
        <Anchor
          component={Link}
          href={`/view/user/${user.id}`}
          size="lg"
          fw={500}
        >
          {user.name || user.id}
        </Anchor>
      </Group>
      <Text size="sm" c="dimmed" mt="xs">
        {user.email}
      </Text>
      <Group mt="md">
        <Button
          variant="outline"
          size="xs"
          onClick={onEdit}
          data-testid="assign-org-button"
        >
          Assign Org
        </Button>
        <Button variant="outline" size="xs" onClick={onMakeAdmin}>
          Make Admin
        </Button>
      </Group>
    </Card>
  );
}
