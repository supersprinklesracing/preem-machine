'use client';

import { Box, Divider, NavLink, Stack } from '@mantine/core';
import {
  IconBike,
  IconBug,
  IconCrown,
  IconDeviceTv,
  IconHome,
  IconShield,
  IconUser,
} from '@tabler/icons-react';
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
          leftSection={<IconHome size={18} />}
          active={pathname === '/'}
          component={Link}
        />
        <NavLink
          href="/organizer"
          label="Event Hub"
          leftSection={<IconCrown size={18} />}
          active={pathname === '/organizer'}
          component={Link}
        />
        <NavLink
          label="Race Management"
          leftSection={<IconBike size={18} />}
          active={pathname.startsWith('/organizer/race')}
          defaultOpened
        >
          {mostRecentRaces.map((race) => (
            <NavLink
              key={race.id}
              href={`/organizer/race/${race.id}`}
              label={race.name}
              leftSection={<Box w={18} />}
              active={pathname === `/organizer/race/${race.id}`}
              component={Link}
            />
          ))}
        </NavLink>
      </div>
      <div>
        <NavLink
          href="/user"
          label="My Profile"
          leftSection={<IconUser size={18} />}
          active={pathname.startsWith('/user')}
          component={Link}
        />
        <Divider my="sm" />
        <Box
          bg="gray.1"
          p="xs"
          style={{ borderRadius: 'var(--mantine-radius-md)' }}
        >
          <NavLink
            label="Debug"
            leftSection={<IconBug size={18} />}
            defaultOpened
          >
            <NavLink
              href="/user/user-1"
              label="User 1"
              leftSection={<IconDeviceTv size={18} />}
              active={pathname === '/user/user-1'}
              component={Link}
            />
            <NavLink
              href="/race/race-1"
              label="Race 1"
              leftSection={<IconDeviceTv size={18} />}
              active={pathname === '/race/race-1'}
              component={Link}
            />
            <NavLink
              href="/organizer/race/race-1"
              label="Organizer Dash 1"
              leftSection={<IconDeviceTv size={18} />}
              active={pathname === '/organizer/race/race-1'}
              component={Link}
            />
            <NavLink
              href="/preem/preem-1a"
              label="Preem 1"
              leftSection={<IconDeviceTv size={18} />}
              active={pathname === '/preem/preem-1a'}
              component={Link}
            />
            <NavLink
              href="/big-screen/race-1"
              label="Big Screen 2"
              leftSection={<IconDeviceTv size={18} />}
              active={pathname === '/big-screen/race-1'}
              component={Link}
            />
            <NavLink
              href="/account"
              label="Account"
              leftSection={<IconDeviceTv size={18} />}
              active={pathname === '/account'}
              component={Link}
            />
            <NavLink
              href="/admin"
              label="Admin"
              leftSection={<IconShield size={18} />}
              active={pathname === '/admin'}
            />
          </NavLink>
        </Box>
      </div>
    </Stack>
  );
};

export default Sidebar;
