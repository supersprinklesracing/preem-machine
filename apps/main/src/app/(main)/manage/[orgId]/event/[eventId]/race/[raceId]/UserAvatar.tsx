'use client';

import { ClientCompat, User } from '@/datastore/types';
import { Avatar, Group, Text } from '@mantine/core';
import Link from 'next/link';

interface UserAvatarProps {
  user?: ClientCompat<User> | null;
}

export default function UserAvatar({ user }: UserAvatarProps) {
  const name = user?.name ?? 'Anonymous';
  const linkHref = user?.id ? `/user/${user.id}` : '#';

  const content = (
    <Group>
      <Avatar src={user?.avatarUrl} alt={name} radius="xl" />
      <Text fw={500} style={{ textDecoration: 'none', color: 'inherit' }}>
        {name}
      </Text>
    </Group>
  );

  if (user?.id) {
    return (
      <Link
        href={linkHref}
        style={{ textDecoration: 'none', color: 'inherit' }}
      >
        {content}
      </Link>
    );
  }

  return content;
}
