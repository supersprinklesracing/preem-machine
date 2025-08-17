'use client';

import { ClientCompat, Event } from '@/datastore/types';
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

interface SidebarData {
  events: ClientCompat<Event>[];
}
interface SidebarProps {
  data: SidebarData;
}

const Sidebar: React.FC<SidebarProps> = ({ data }) => {
  const pathname = usePathname();
  const primaryOrgId = data.events[0]?.seriesBrief?.organizationBrief?.id;

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
          href={primaryOrgId ? `/manage/${primaryOrgId}` : '/'}
          label="Event Hub"
          leftSection={<IconCrown size={18} />}
          active={pathname.startsWith('/manage')}
          component={Link}
        />
        <NavLink
          label="Event Management"
          leftSection={<IconBike size={18} />}
          active={pathname.startsWith('/manage')}
          defaultOpened
        >
          {data.events.map((event) => {
            const orgId = event.seriesBrief?.organizationBrief?.id;
            if (!orgId) return null;
            const href = `/manage/${orgId}/event/${event.id}`;
            return (
              <NavLink
                key={event.id}
                href={href}
                label={event.name}
                leftSection={<Box w={18} />}
                active={pathname === href}
                component={Link}
              />
            );
          })}
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
        <Box p="xs" style={{ borderRadius: 'var(--mantine-radius-md)' }}>
          <NavLink
            label="Debug"
            leftSection={<IconBug size={18} />}
            defaultOpened
          >
            <NavLink
              href="/user/eygr7FzGzsb987AVm5uavrYTP7Q2"
              label="User"
              leftSection={<IconDeviceTv size={18} />}
              active={pathname === '/user/eygr7FzGzsb987AVm5uavrYTP7Q2'}
              component={Link}
            />
            <NavLink
              href="/race/race-giro-sf-2025-masters-women"
              label="Race"
              leftSection={<IconDeviceTv size={18} />}
              active={pathname === '/race/race-giro-sf-2025-masters-women'}
              component={Link}
            />
            <NavLink
              href="/manage/org-super-sprinkles/event/event-giro-sf-2025/race/race-giro-sf-2025-masters-women"
              label="Manage Dash"
              leftSection={<IconDeviceTv size={18} />}
              active={
                pathname ===
                '/manage/org-super-sprinkles/event/event-giro-sf-2025/race/race-giro-sf-2025-masters-women'
              }
              component={Link}
            />
            <NavLink
              href="/preem/preem-giro-sf-2025-masters-women-first-lap"
              label="Preem"
              leftSection={<IconDeviceTv size={18} />}
              active={
                pathname === '/preem/preem-giro-sf-2025-masters-women-first-lap'
              }
              component={Link}
            />
            <NavLink
              href="/big-screen/race-giro-sf-2025-masters-women"
              label="Big Screen"
              leftSection={<IconDeviceTv size={18} />}
              active={
                pathname === '/big-screen/race-giro-sf-2025-masters-women'
              }
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
            <NavLink
              href="/organization/org-super-sprinkles"
              label="Organization"
              leftSection={<IconDeviceTv size={18} />}
              active={pathname === '/organization/org-super-sprinkles'}
              component={Link}
            />
            <NavLink
              href="/series/series-giro-sf"
              label="Series"
              leftSection={<IconDeviceTv size={18} />}
              active={pathname === '/series/series-giro-sf'}
              component={Link}
            />
            <NavLink
              href="/event/event-giro-sf-2025"
              label="Event"
              leftSection={<IconDeviceTv size={18} />}
              active={pathname === '/event/event-giro-sf-2025'}
              component={Link}
            />
            <NavLink
              href="/manage/org-super-sprinkles"
              label="Manage"
              leftSection={<IconDeviceTv size={18} />}
              active={pathname.startsWith('/manage')}
              component={Link}
            />
          </NavLink>
        </Box>
      </div>
    </Stack>
  );
};

export default Sidebar;
