'use client';

import { Group } from '@mantine/core';

import {
  LoggedOutAvatarIcon,
  UserAvatarIcon,
} from '@/components/UserAvatar/UserAvatar';
import { useUserContext } from '@/user/client/UserContext';

export function AvatarCluster() {
  const { user } = useUserContext();

  return (
    <Group>
      {user ? <UserAvatarIcon user={user} /> : <LoggedOutAvatarIcon />}
    </Group>
  );
}
