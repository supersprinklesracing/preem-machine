'use client';

import { Avatar, Group, MantineSize, Text } from '@mantine/core';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { toUrlPath } from '@/datastore/paths';
import { User } from '@/datastore/schema';

interface UserAvatarProps {
  user?: Pick<User, 'id' | 'path' | 'name' | 'avatarUrl'> | null;
  size?: MantineSize;
}

export function UserAvatar({ user, size = 'md' }: UserAvatarProps) {
  const name = user?.name ?? 'Anonymous';
  const linkHref = user?.path ? `/view/${toUrlPath(user.path)}` : '#';

  const content = (
    <Group>
      {/*
        Palette: Removed alt text because the name is displayed right next to the avatar.
        This prevents screen readers from reading the name twice.
      */}
      <Avatar src={user?.avatarUrl} alt="" radius="50%" size={size} />
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
        aria-label={name}
      >
        {content}
      </Link>
    );
  }

  return content;
}

export function UserAvatarIcon({ user, size = 'md' }: UserAvatarProps) {
  const name = user?.name ?? 'Anonymous';
  const linkHref = user?.path ? `/view/${toUrlPath(user.path)}` : '#';

  const content = (
    <Avatar src={user?.avatarUrl} alt={name} radius="50%" size={size} />
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

export function LoggedOutAvatarIcon({ size = 'md' }: UserAvatarProps) {
  const pathname = usePathname();
  return (
    <Link
      href={`/login?redirect=${pathname}`}
      style={{ textDecoration: 'none', color: 'inherit' }}
      aria-label="Log in"
    >
      <Avatar radius="50%" size={size} />
    </Link>
  );
}
