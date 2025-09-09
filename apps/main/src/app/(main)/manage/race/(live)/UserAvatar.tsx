'use client';

import { DocPath, toUrlPath } from '@/datastore/paths';
import { UserBrief } from '@/datastore/schema';
import { Avatar, Group, Text } from '@mantine/core';
import Link from 'next/link';

interface UserAvatarProps {
  user?: UserBrief | null;
}

export default function UserAvatar({ user }: UserAvatarProps) {
  const name = user?.name ?? 'Anonymous';
  const linkHref = user?.path ? `/${toUrlPath(user.path)}` : '#';

  const content = (
    <Group>
      <Avatar src={user?.avatarUrl} alt={name} radius="xl" />
      <Text fw={500} style={{ textDecoration: 'none', color: 'inherit' }}>
        {name}
      </Text>
    </Group>
  );

  if (user?.path) {
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
