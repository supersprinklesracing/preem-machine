'use client';

import { toUrlPath } from '@/datastore/paths';
import { usePathname } from 'next/navigation';
import { User } from '@/datastore/schema';
import { Avatar, Group, MantineSize, Text } from '@mantine/core';
import Link from 'next/link';

// Extracted base component for reuse
interface BaseUserAvatarProps {
  name?: string | null;
  avatarUrl?: string | null;
  size?: MantineSize | number;
}

export function BaseUserAvatar({
  name,
  avatarUrl,
  size = 'md',
}: BaseUserAvatarProps) {
  return (
    <Avatar src={avatarUrl} alt={name ?? 'Anonymous'} radius="50%" size={size} />
  );
}

interface UserAvatarProps {
  user?: Pick<User, 'id' | 'path' | 'name' | 'avatarUrl'> | null;
  size?: MantineSize | number;
}

export function UserAvatar({ user, size = 'md' }: UserAvatarProps) {
  const name = user?.name ?? 'Anonymous';
  const linkHref = user?.path ? `/${toUrlPath(user.path)}` : '#';

  const content = (
    <Group>
      <BaseUserAvatar
        name={user?.name}
        avatarUrl={user?.avatarUrl}
        size={size}
      />
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

export function UserAvatarIcon({ user, size = 'md' }: UserAvatarProps) {
  const name = user?.name ?? 'Anonymous';
  const linkHref = user?.path ? `/${toUrlPath(user.path)}` : '#';

  const content = (
    <BaseUserAvatar name={name} avatarUrl={user?.avatarUrl} size={size} />
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

export function LoggedOutAvatarIcon({
  size = 'md',
}: Omit<UserAvatarProps, 'user'>) {
  const pathname = usePathname();
  return (
    <Link
      href={`/login?redirect=${pathname}`}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <Avatar radius="50%" size={size} />
    </Link>
  );
}