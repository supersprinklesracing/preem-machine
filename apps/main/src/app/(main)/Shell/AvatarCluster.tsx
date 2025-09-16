'use client';

import {
  LoggedOutAvatarIcon,
  UserAvatarIcon,
} from '@/components/UserAvatar/UserAvatar';
import { useUserContext } from '@/user/client/UserContext';
import { Group } from '@mantine/core';

export default function AvatarCluster() {
  const { user } = useUserContext();

  return (
    <Group>
      {user ? <UserAvatarIcon user={user} /> : <LoggedOutAvatarIcon />}
    </Group>
  );
}
