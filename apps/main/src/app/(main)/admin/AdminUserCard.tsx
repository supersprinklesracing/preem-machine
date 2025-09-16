'use client';

import { User } from '@/datastore/schema';
import { Card, Text, Button, Group, Anchor } from '@mantine/core';
import Link from 'next/link';

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
        <Anchor component={Link} href={`/user/${user.id}`} size="lg" fw={500}>
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
