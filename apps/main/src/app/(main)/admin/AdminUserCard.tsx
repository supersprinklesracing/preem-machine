'use client';

import { Anchor, Button, Group, Text } from '@mantine/core';
import Link from 'next/link';

import { ContentCard } from '@/components/cards/ContentCard';
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
  const buttons = (
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
  );

  return (
    <ContentCard
      title={
        <Anchor component={Link} href={`/user/${user.id}`} size="lg" fw={500}>
          {user.name || user.id}
        </Anchor>
      }
      subheadings={[
        <Text key="email" size="sm" c="dimmed" mt="xs">
          {user.email}
        </Text>,
      ]}
      bottomContent={buttons}
    />
  );
}