'use client';

import { NavLink, Stack } from '@mantine/core';
import { IconBike, IconCrown, IconUser } from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import type { Race } from '@/datastore/types';

interface SidebarProps {
  races: Race[];
}

const Sidebar: React.FC<SidebarProps> = ({ races }) => {
  const pathname = usePathname();

  const mostRecentRaces = races
    .sort(
      (a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
    )
    .slice(0, 2);

  return (
    <Stack justify="space-between" style={{ height: '100%' }}>
      <div>
        <NavLink
          href="/"
          label="Home"
          leftSection={<IconBike size={18} />}
          active={pathname === '/'}
          component={Link}
        />
        <NavLink
          href="/organizer"
          label="Organizer Hub"
          leftSection={<IconCrown size={18} />}
          active={pathname.startsWith('/organizer')}
          component={Link}
          defaultOpened
        >
          {mostRecentRaces.map((race) => (
            <NavLink
              key={race.id}
              href={`/organizer/race/${race.id}`}
              label={race.name}
              active={pathname === `/organizer/race/${race.id}`}
              component={Link}
            />
          ))}
        </NavLink>
      </div>
      <NavLink
        href="/user"
        label="My Profile"
        leftSection={<IconUser size={18} />}
        active={pathname.startsWith('/user')}
        component={Link}
      />
    </Stack>
  );
};

export default Sidebar;
